import type { DocumentNode } from "graphql";
import {
	aggregateBurns,
	type BurnOutputRow,
	type KnownBurns,
	TOKENBURNER_LOCKING_BYTECODE,
	type TokenOutputRow,
} from "~/module/tokenStats";
import {
	GetTokenBurnerOutputs,
	GetTokenIssuingOutputs,
	GetTokenOpReturnOutputs,
	GetTokenUnspentOutputs,
	TOKEN_STATS_PAGE_SIZE,
} from "~/module/tokenStatsQueries";
import { useStateStore } from "~/store";

/** Upper bound so a runaway category can't page forever (1,000,000 outputs). */
const MAX_PAGES = 200;

export type LoadState<T> =
	| { status: "loading" }
	| { status: "error"; message: string }
	| { status: "ready"; value: T };

type ApolloLike = {
	query: (options: {
		query: DocumentNode;
		variables: Record<string, unknown>;
		fetchPolicy: "no-cache";
		context: unknown;
	}) => Promise<{ data: Record<string, unknown[]> }>;
};

/** Fetch every page of a 5000-row Chaingraph query; never returns a partial list. */
export const fetchAllPages = async <Row>(
	client: ApolloLike,
	query: DocumentNode,
	field: string,
	variables: Record<string, unknown>,
	signal: AbortSignal,
): Promise<Row[]> => {
	const rows: Row[] = [];
	for (let page = 0; page < MAX_PAGES; page++) {
		const response = await client.query({
			query,
			variables: { ...variables, offset: page * TOKEN_STATS_PAGE_SIZE },
			fetchPolicy: "no-cache",
			context: { fetchOptions: { signal } },
		});
		const batch = response.data?.[field] as Row[] | undefined;
		if (!batch) throw new Error("Chaingraph returned no data.");
		rows.push(...batch);
		if (batch.length < TOKEN_STATS_PAGE_SIZE) return rows;
	}
	throw new Error("Too many outputs to load completely.");
};

const describeError = (error: unknown) =>
	error instanceof Error ? error.message : String(error);

/**
 * Loads, for a category: the unspent minting/mutable outputs (fast, for the
 * reserve), the complete set of unspent token outputs (holders), and the
 * provable burns. Each result is all-or-nothing, so derived figures are never
 * based on a partial page.
 */
export const useTokenOutputs = (category: Ref<string>) => {
	const { clients } = useApollo();
	const stateStore = useStateStore();
	const issuing = ref<LoadState<TokenOutputRow[]>>({ status: "loading" });
	const unspent = ref<LoadState<TokenOutputRow[]>>({ status: "loading" });
	const burns = ref<LoadState<KnownBurns>>({ status: "loading" });
	const attempt = ref(0);

	watch(
		() => [category.value, stateStore.network, attempt.value] as const,
		([target], _previous, onCleanup) => {
			const controller = new AbortController();
			onCleanup(() => controller.abort());
			issuing.value = { status: "loading" };
			unspent.value = { status: "loading" };
			burns.value = { status: "loading" };
			const client = clients?.default as unknown as ApolloLike | undefined;
			if (!client) {
				const failed = {
					status: "error",
					message: "Chaingraph is unavailable.",
				} as const;
				issuing.value = failed;
				unspent.value = failed;
				burns.value = failed;
				return;
			}
			const tokenCategory = `\\x${target.toLowerCase()}`;
			const context = { fetchOptions: { signal: controller.signal } };

			client
				.query({
					query: GetTokenIssuingOutputs,
					variables: { tokenCategory },
					fetchPolicy: "no-cache",
					context,
				})
				.then(
					(response) => {
						if (controller.signal.aborted) return;
						const rows = response.data?.output as TokenOutputRow[] | undefined;
						issuing.value = rows
							? { status: "ready", value: rows }
							: { status: "error", message: "Chaingraph returned no data." };
					},
					(error) => {
						if (!controller.signal.aborted)
							issuing.value = {
								status: "error",
								message: describeError(error),
							};
					},
				);

			fetchAllPages<TokenOutputRow>(
				client,
				GetTokenUnspentOutputs,
				"output",
				{ tokenCategory },
				controller.signal,
			).then(
				(rows) => {
					if (!controller.signal.aborted)
						unspent.value = { status: "ready", value: rows };
				},
				(error) => {
					if (!controller.signal.aborted)
						unspent.value = { status: "error", message: describeError(error) };
				},
			);

			Promise.all([
				fetchAllPages<BurnOutputRow>(
					client,
					GetTokenOpReturnOutputs,
					"output",
					{ tokenCategory },
					controller.signal,
				),
				fetchAllPages<BurnOutputRow>(
					client,
					GetTokenBurnerOutputs,
					"output",
					{
						tokenCategory,
						lockingBytecode: `\\x${TOKENBURNER_LOCKING_BYTECODE}`,
					},
					controller.signal,
				),
			]).then(
				([opReturn, burner]) => {
					if (!controller.signal.aborted)
						burns.value = {
							status: "ready",
							value: aggregateBurns([...opReturn, ...burner]),
						};
				},
				(error) => {
					if (!controller.signal.aborted)
						burns.value = { status: "error", message: describeError(error) };
				},
			);
		},
		{ immediate: true },
	);

	/** Reload everything, e.g. after a timeout. */
	const retry = () => {
		attempt.value++;
	};

	return { issuing, unspent, burns, retry };
};
