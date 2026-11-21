<template>
  <TableView
    title="Address Tokens"
    :rows="rows"
    :columns="['token', 'category', 'amount']"
    :has-prev-page="page > 0"
    :has-next-page="hasNextPage"
    :loading="state.status === 'loading'"
    :error="state.status === 'error' ? state.message : undefined"
    @next="page += 1"
    @previous="page = Math.max(0, page - 1)"
  />
</template>

<script setup lang="ts">
import { useAuthChains } from "~/hooks/authchains";
import { fetchAllPages, type LoadState } from "~/hooks/tokenStats";
import { formatTokenAmount, toBaseUnits } from "~/module/tokenAmount";
import { hexOf } from "~/module/tokenStats";
import { GetAddressTokenOutputs } from "~/module/tokenStatsQueries";
import { useRegistryStore, useStateStore } from "~/store";
import type { tableColumn } from "~/types/index.js";

const PAGE_SIZE = 8;
const props = defineProps<{
	lockingBytecode: string;
}>();
const stateStore = useStateStore();
const registryStore = useRegistryStore();
const { clients } = useApollo();

type AddressTokenRow = {
	transaction_hash: string;
	output_index: string;
	token_category: string | null;
	fungible_token_amount?: string | null;
};

const page = ref(0);
const state = ref<LoadState<{ category: string; amount: bigint }[]>>({
	status: "loading",
});

watch(
	() => [props.lockingBytecode, stateStore.network] as const,
	([lockingBytecode, network], _previous, onCleanup) => {
		const controller = new AbortController();
		onCleanup(() => controller.abort());
		page.value = 0;
		state.value = { status: "loading" };
		const client = clients?.default;
		if (!client) {
			state.value = { status: "error", message: "Chaingraph is unavailable." };
			return;
		}
		fetchAllPages<AddressTokenRow>(
			// biome-ignore lint/suspicious/noExplicitAny: Apollo client shape
			client as any,
			GetAddressTokenOutputs,
			"search_output",
			{ network, lockingBytecode: `{${hexOf(lockingBytecode)}}` },
			controller.signal,
		).then(
			(rows) => {
				if (controller.signal.aborted) return;
				// Sum every unspent output per category (deduplicated by outpoint),
				// including FT carried on NFT outputs.
				const seen = new Set<string>();
				const balances = new Map<string, bigint>();
				for (const row of rows) {
					if (!row.token_category) continue;
					const outpoint = `${row.transaction_hash}:${row.output_index}`;
					if (seen.has(outpoint)) continue;
					seen.add(outpoint);
					const category = hexOf(row.token_category);
					balances.set(
						category,
						(balances.get(category) ?? 0n) +
							toBaseUnits(row.fungible_token_amount),
					);
				}
				const tokens = [...balances]
					.filter(([, amount]) => amount > 0n)
					.map(([category, amount]) => ({ category, amount }))
					// Base units of different tokens aren't comparable (decimals
					// differ), so order by category for a stable listing.
					.sort((a, b) => a.category.localeCompare(b.category));
				state.value = { status: "ready", value: tokens };
			},
			(error) => {
				if (!controller.signal.aborted)
					state.value = {
						status: "error",
						message: error instanceof Error ? error.message : String(error),
					};
			},
		);
	},
	{ immediate: true },
);

const tokens = computed(() =>
	state.value.status === "ready" ? state.value.value : [],
);
const hasNextPage = computed(
	() => (page.value + 1) * PAGE_SIZE < tokens.value.length,
);
const visibleTokens = computed(() =>
	tokens.value.slice(page.value * PAGE_SIZE, (page.value + 1) * PAGE_SIZE),
);

const rows = computed<tableColumn[][]>(() =>
	visibleTokens.value.map(({ category, amount }) => {
		const metadata = registryStore.getToken(category);
		const name = metadata?.loading ? false : metadata?.token?.name || "N/A";
		return [
			{
				text: name || "Loading...",
				token: { category },
				url: `/token/${category}`,
			},
			{
				text: category,
				short: true,
				copy: true,
				url: `/token/${category}`,
			},
			{
				// Without loaded metadata the decimals are unknown: show base units.
				text: metadata?.loading
					? "Loading..."
					: formatTokenAmount(amount, metadata?.token?.decimals),
			},
		];
	}),
);

useAuthChains(
	toRef(() => visibleTokens.value.map(({ category }) => `\\x${category}` as const)),
);
</script>
