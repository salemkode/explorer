<template>
  <TableView
    title="Address Tokens"
    :rows="transactions"
    :columns="['token', 'category', 'amount']"
    :has-prev-page="!!offset"
    :has-next-page="!!hasNextPage"
    :loading="loading"
    :error="error?.message"
    @next="offset += 8"
    @previous="offset -= 8"
  />
</template>

<script setup lang="ts">
import { GetAddressTokens } from "@/module/chaingraph";
import { useAuthChains } from "~/hooks/authchains";
import { calculateDecimal } from "~/module/bitcoin";
import { useRegistryStore, useStateStore } from "~/store";
import type { tableColumn } from "~/types/index.js";

const limit = ref(9);
const offset = ref(0);
const props = defineProps<{
	lockingBytecode: string;
}>();
const stateStore = useStateStore();
const variables = computed(() => ({
	network: stateStore.network,
	lockingBytecode: `{${props.lockingBytecode}}`,
	offset: offset.value,
	limit: limit.value,
}));

const registryStore = useRegistryStore();
const {
	result: transaction,
	error,
	loading,
} = useQuery(GetAddressTokens, variables);
const hasNextPage = computed(() => {
	if (transaction.value) {
		return transaction.value.search_output.length === limit.value;
	}
	return false;
});
const transactions = computed<tableColumn[][]>(() => {
	if (!transaction.value) {
		return [];
	}
	let outputs = transaction.value?.search_output;
	if (outputs.length === limit.value) {
		outputs = outputs.slice(0, -1);
	}

	// Remove duplicate
	const tokens = new Map<string, number>();
	for (const item of outputs) {
		if (!item.token_category) continue;

		const inMapItem = tokens.get(item.token_category);
		if (inMapItem) {
			tokens.set(
				item.token_category,
				inMapItem + Number(item.fungible_token_amount),
			);
		} else {
			tokens.set(item.token_category, Number(item.fungible_token_amount));
		}
	}

	const items = Array.from(tokens, ([categoryBytea, amount]) => {
		const category = categoryBytea?.substring(2) || "";
		const metadata = registryStore.getToken(category);
		const decimals = metadata.token?.decimals;
		const name = metadata?.loading ? false : metadata?.token?.name || "N/A";
		return [
			{
				text: name || "Loading...",
				token: {
					category: category,
				},
				url: `/token/${category}`,
			},
			{
				text: category,
				short: true,
				copy: true,
				url: `/token/${category}`,
			},
			{
				text: calculateDecimal(amount, decimals || 0).toString() || "N/A",
			},
		];
	});

	return items;
});

useAuthChains(
	toRef(
		() =>
			transaction.value?.search_output
				.map((token) => token.token_category)
				.filter(Boolean) || [],
	),
);
</script>
