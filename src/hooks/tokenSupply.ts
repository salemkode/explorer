import { computed, type MaybeRefOrGetter, ref, toValue, watch } from "vue";
import {
	circulationAfterReserve,
	confirmedReserveAmount,
	scanTokenSupply,
} from "~/module/tokenSupply";
import {
	GetSupplyAuthhead,
	GetSupplyReserve,
	GetSupplySnapshot,
	GetSupplyTransactions,
	VerifySupplySnapshot,
} from "~/module/tokenSupplyQueries";
import { useStateStore } from "~/store/state";
import type { bytea } from "~/types";

export function useTokenSupply(
	category: Ref<string>,
	selectedAuthhead?: MaybeRefOrGetter<string | undefined>,
) {
	const { clients } = useApollo();
	const stateStore = useStateStore();
	const attempt = ref(0);
	const calculation = ref<
		| { status: "loading" }
		| { status: "unknown"; reason: string }
		| {
				status: "ready";
				supply: Extract<
					Awaited<ReturnType<typeof scanTokenSupply>>,
					{ status: "complete" }
				>;
				height: string;
				node: string;
				reserve: bigint | null;
		  }
	>({ status: "loading" });
	const scope = computed(() => ({
		category: category.value,
		network: stateStore.network,
		attempt: attempt.value,
		selectedAuthhead: toValue(selectedAuthhead),
	}));

	watch(
		scope,
		async (target, _previous, onCleanup) => {
			const controller = new AbortController();
			calculation.value = { status: "loading" };
			const timeout = setTimeout(() => {
				controller.abort();
				calculation.value = {
					status: "unknown",
					reason:
						"The supply calculation timed out after 60 seconds. Try again when the indexer is available.",
				};
			}, 60_000);
			onCleanup(() => {
				controller.abort();
				clearTimeout(timeout);
			});
			const client = clients?.default;
			if (!client) {
				clearTimeout(timeout);
				calculation.value = {
					status: "unknown",
					reason: "The token indexer is unavailable.",
				};
				return;
			}
			const context = { fetchOptions: { signal: controller.signal } };
			try {
				const snapshot = await client.query({
					query: GetSupplySnapshot,
					variables: { network: target.network },
					fetchPolicy: "no-cache",
					context,
				});
				const node = snapshot.data.node.at(0);
				const tip = node?.accepted_blocks.at(0)?.block;
				if (!node || !tip) {
					if (!controller.signal.aborted)
						calculation.value = {
							status: "unknown",
							reason: "No accepted block is available for this network.",
						};
					return;
				}
				const category: bytea = `\\x${target.category.toLowerCase()}`;
				const supply = await scanTokenSupply(
					category,
					async (cursor) => {
						const response = await client.query({
							query: GetSupplyTransactions,
							variables: {
								category,
								node: node.internal_id,
								height: tip.height,
								cursor,
								limit: 100,
							},
							fetchPolicy: "no-cache",
							context,
						});
						return response.data.transaction;
					},
					{ maxPages: 200, signal: controller.signal },
				);
				if (controller.signal.aborted) return;
				if (supply.status === "unknown") {
					calculation.value = supply;
					return;
				}
				const authchain = await client.query({
					query: GetSupplyAuthhead,
					variables: { category, node: node.internal_id, height: tip.height },
					fetchPolicy: "no-cache",
					context,
				});
				const heads = new Set(
					authchain.data.transaction.flatMap((tx) =>
						tx.authchains.flatMap((chain) =>
							chain.authhead ? [chain.authhead.hash] : [],
						),
					),
				);
				const selected = target.selectedAuthhead
					? (`\\x${target.selectedAuthhead}` as const)
					: undefined;
				const head = selected
					? heads.has(selected)
						? selected
						: undefined
					: heads.size === 1
						? [...heads][0]
						: undefined;

				const reserve = head
					? confirmedReserveAmount(
							(
								await client.query({
									query: GetSupplyReserve,
									variables: {
										head,
										node: node.internal_id,
										height: tip.height,
									},
									fetchPolicy: "no-cache",
									context,
								})
							).data,
							category,
						)
					: null;
				const verified = await client.query({
					query: VerifySupplySnapshot,
					variables: { node: node.internal_id, hash: tip.hash },
					fetchPolicy: "no-cache",
					context,
				});
				if (controller.signal.aborted) return;
				calculation.value =
					verified.data.node_block.length === 1
						? {
								status: "ready",
								supply,
								height: tip.height,
								node: node.name,
								reserve,
							}
						: {
								status: "unknown",
								reason:
									"The chain changed during calculation. Recalculate using the new accepted chain.",
							};
			} catch {
				if (!controller.signal.aborted)
					calculation.value = {
						status: "unknown",
						reason:
							"The indexer could not provide a complete supply history. Try again later.",
					};
			} finally {
				clearTimeout(timeout);
			}
		},
		{ immediate: true, flush: "sync" },
	);

	const circulation = computed(() =>
		calculation.value.status === "ready" && calculation.value.reserve !== null
			? circulationAfterReserve(
					calculation.value.supply.current,
					calculation.value.reserve,
				)
			: null,
	);

	return {
		calculation,
		circulation,
		recalculate: () => {
			attempt.value += 1;
		},
	};
}
