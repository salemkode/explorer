import type { DocumentNode } from "graphql";
import {
	type BurnOutputRow,
	type KnownBurns,
	TOKENBURNER_LOCKING_BYTECODE,
	type TokenOutputRow,
	aggregateBurns,
	isAcceptedTransaction,
} from "~/module/tokenStats";
import {
	GetNetworkNodes,
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

/** Chaingraph node ids of the selected network; acceptance is checked against them. */
const loadNetworkNodes = async (
	client: ApolloLike,
	network: string,
	signal: AbortSignal,
) => {
	const response = await client.query({
		query: GetNetworkNodes,
		variables: { network },
		fetchPolicy: "no-cache",
		context: { fetchOptions: { signal } },
	});
	const nodes = (response.data?.node as { internal_id: number }[] | undefined)
		?.map(({ internal_id }) => internal_id)
		.filter(Number.isInteger);
	if (!nodes?.length)
		throw new Error(`Chaingraph has no node for the ${network} network.`);
	return nodes;
};

/** Keep outputs whose creating transaction the selected network has. */
const acceptedOutputs = (rows: TokenOutputRow[]) =>
	rows.filter((row) => isAcceptedTransaction(row.transaction));

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

	watch(
		() => [category.value, stateStore.network] as const,
		([target, network], _previous, onCleanup) => {
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
			const { signal } = controller;
			const nodes = loadNetworkNodes(client, network, signal);
			const fail = (state: Ref<LoadState<unknown>>) => (error: unknown) => {
				if (!signal.aborted)
					state.value = { status: "error", message: describeError(error) };
			};

			nodes
				.then((nodes) =>
					client.query({
						query: GetTokenIssuingOutputs,
						variables: { tokenCategory, nodes },
						fetchPolicy: "no-cache",
						context: { fetchOptions: { signal } },
					}),
				)
				.then((response) => {
					if (signal.aborted) return;
					const rows = response.data?.output as TokenOutputRow[] | undefined;
					if (!rows) throw new Error("Chaingraph returned no data.");
					// A full page may be truncated: never present a partial reserve.
					if (rows.length >= TOKEN_STATS_PAGE_SIZE)
						throw new Error(
							"Too many minting and mutable outputs for the quick reserve query.",
						);
					issuing.value = { status: "ready", value: acceptedOutputs(rows) };
				})
				.catch(fail(issuing));

			nodes
				.then((nodes) =>
					fetchAllPages<TokenOutputRow>(
						client,
						GetTokenUnspentOutputs,
						"output",
						{ tokenCategory, nodes },
						signal,
					),
				)
				.then((rows) => {
					if (!signal.aborted)
						unspent.value = { status: "ready", value: acceptedOutputs(rows) };
				})
				.catch(fail(unspent));

			nodes
				.then((nodes) =>
					Promise.all([
						fetchAllPages<BurnOutputRow>(
							client,
							GetTokenOpReturnOutputs,
							"output",
							{ tokenCategory, nodes },
							signal,
						),
						fetchAllPages<BurnOutputRow>(
							client,
							GetTokenBurnerOutputs,
							"output",
							{
								tokenCategory,
								nodes,
								lockingBytecode: `\\x${TOKENBURNER_LOCKING_BYTECODE}`,
							},
							signal,
						),
					]),
				)
				.then(([opReturn, burner]) => {
					if (!signal.aborted)
						burns.value = {
							status: "ready",
							value: aggregateBurns([...opReturn, ...burner]),
						};
				})
				.catch(fail(burns));
		},
		{ immediate: true },
	);

	return { issuing, unspent, burns };
};
