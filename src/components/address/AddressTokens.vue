<template>
  <div class="space-y-3">
    <TokenBalanceStatus :state="state" @refresh="refresh" />
    <TableView
      title="Address Tokens"
      :rows="transactions"
      :columns="['token', 'category', 'amount']"
      :row-keys="page.map((item) => item.key)"
      empty-message="No confirmed token balances at this address."
      :has-prev-page="offset > 0"
      :has-next-page="offset + 8 < balances.length"
      :loading="state.status === 'loading'"
      :error="state.status === 'error' ? state.message : ''"
      @next="offset += 8"
      @previous="offset -= 8"
    />
  </div>
</template>

<script setup lang="ts">
import { useAuthChains } from "~/hooks/authchains";
import { useConfirmedTokenBalances } from "~/hooks/confirmedTokenBalances";
import { calculateDecimal } from "~/module/bitcoin";
import { groupTokenBalances } from "~/module/tokenBalances";
import { useRegistryStore, useStateStore } from "~/store";
import type { tableColumn } from "~/types/index.js";

const props = defineProps<{ lockingBytecode: string }>();
const stateStore = useStateStore();
const registryStore = useRegistryStore();
const scope = computed(() => ({
	network: stateStore.network,
	filter: { locking_bytecode: { _eq: `\\x${props.lockingBytecode}` as const } },
}));
const { state, refresh } = useConfirmedTokenBalances(scope);
const offset = ref(0);
watch(
	state,
	() => {
		offset.value = 0;
	},
	{ flush: "sync" },
);
const balances = computed(() =>
	state.value.status === "ready"
		? groupTokenBalances(state.value.outputs, "token_category")
		: [],
);
const page = computed(() =>
	balances.value.slice(offset.value, offset.value + 8),
);
const transactions = computed<tableColumn[][]>(() =>
	page.value.map(({ key, amount }) => {
		const category = key.substring(2);
		const metadata = registryStore.getToken(category);
		return [
			{
				text: metadata.loading
					? "Loading…"
					: metadata.token?.name || "Unknown token",
				token: { category },
				url: `/token/${category}`,
			},
			{ text: category, short: true, copy: true, url: `/token/${category}` },
			{
				text: calculateDecimal(amount, metadata.token?.decimals || 0).toFixed(),
			},
		];
	}),
);
useAuthChains(
	computed(() =>
		state.value.status === "ready"
			? [
					...new Set(
						state.value.outputs
							.map((output) => output.token_category)
							.filter(Boolean),
					),
				]
			: [],
	),
);
</script>
