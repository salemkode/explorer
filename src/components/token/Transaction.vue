<template>
  <TableView
    title="Token Transactions"
    :rows="transactions"
    :columns="['txid', 'block_height', 'timestamp']"
    :has-prev-page="!!offset"
    :has-next-page="!!hasNextPage"
    :loading="loading"
    :error="error?.message"
    @next="offset += 8"
    @previous="offset -= 8"
  />
</template>

<script setup lang="ts">
import { GetTokenTxs } from "@/module/chaingraph";
import { formatDateString } from "~/module/utils";
import { useStateStore } from "~/store";
import type { tableColumn } from "~/types/index.js";

const limit = ref(9);
const offset = ref(0);
const props = defineProps<{
	category: string;
}>();
const stateStore = useStateStore();
const variables = computed(() => ({
	network: stateStore.network,
	tokenCategory: `\\x${props.category}` as const,
	offset: offset.value,
	limit: limit.value,
}));

const {
	result: transaction,
	error,
	loading,
} = useQuery(GetTokenTxs, variables);
const hasNextPage = computed(() => {
	if (transaction.value) {
		return transaction.value.block_transaction.length === limit.value;
	}
	return false;
});
const transactions = computed<tableColumn[][]>(() => {
	if (!transaction.value) {
		return [];
	}
	let items = transaction.value?.block_transaction.map(
		({ block, transaction }) => [
			{
				text: transaction.hash.substring(2),
				short: true,
				copy: true,
				url: `/tx/${transaction.hash.substring(2)}`,
			},
			{
				text: block.height,
				url: `/block/${block.height}`,
			},
			{
				text: formatDateString(new Date(+block.timestamp * 1000)),
			},
		],
	);

	if (items.length === limit.value) {
		items = items.slice(0, -1);
	}

	return items;
});
</script>
