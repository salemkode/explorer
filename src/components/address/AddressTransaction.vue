<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
    <div class="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
      <h3 class="text-base font-bold text-slate-900 dark:text-white">
        Latest Transactions
      </h3>
      <BasePagination
        :has-next-page="hasNextPage"
        :has-prev-page="hasPrevPage"
        @next="offset += limit"
        @previous="offset -= limit"
      />
    </div>
    <Transition name="fade" mode="out-in">
      <LoadingSpinner v-if="loading" class="py-12" />
      <div
        v-else-if="transactions.length === 0 || error"
        class="py-12 text-center text-sm text-slate-400 dark:text-zinc-500"
      >
        No transactions found for this address
      </div>
      <TransactionList v-else :transactions="transactions" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { history as History } from "electrum-cash";
import { GetTransactions } from "~/module/chaingraph";
import { useStateStore } from "~/store";

const limit = ref(8);
const offset = ref(0);
const stateStore = useStateStore();
const props = defineProps<{
	history: History;
}>();
const hasPrevPage = computed(() => offset.value > 0);
const hasNextPage = computed(() => {
	if (Array.isArray(props.history)) {
		return props.history.length > limit.value + offset.value;
	}
	return false;
});
const sortedHistory = computed(() => {
	if (!Array.isArray(props.history)) {
		return [];
	}
	return props.history.slice().sort((tx1, tx2) => tx2.height - tx1.height);
});

const transactionsHash = computed(() => {
	return sortedHistory.value
		.slice(offset.value, offset.value + limit.value)
		?.map((transaction) => `\\x${transaction.tx_hash}` as const);
});
const variables = computed(() => ({
	network: stateStore.network,
	hashes: transactionsHash.value,
}));
const {
	result: transactionsQuery,
	error,
	loading,
} = useQuery(GetTransactions, variables);

const transactions = computed(() => {
	if (!transactionsQuery.value) {
		return [];
	}
	return transactionsQuery.value.transaction;
});
</script>
