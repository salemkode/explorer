<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <i class="uicon-duplicate text-emerald-600 dark:text-emerald-400 text-base" />
        <h3 class="text-base font-bold text-slate-900 dark:text-white">
          Latest Transactions
        </h3>
      </div>
      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Mempool
      </span>
    </div>

    <Transition name="fade" mode="out-in">
      <div
        v-if="loading && transactions.length === 0"
        key="loading"
        class="divide-y divide-slate-100 dark:divide-zinc-800/60"
      >
        <div
          v-for="i in limit"
          :key="i"
          class="flex items-center justify-between gap-4 px-5 py-3.5 animate-pulse"
        >
          <div class="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-md w-32" />
          <div class="h-3 bg-slate-100 dark:bg-zinc-800/60 rounded-md w-48 hidden md:block" />
          <div class="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-md w-20 ml-auto" />
        </div>
      </div>
      <div
        v-else-if="transactions.length === 0"
        key="empty"
        class="py-12 text-center text-sm text-slate-400 dark:text-zinc-500"
      >
        No unconfirmed transactions in mempool
      </div>
      <TransactionList
        v-else
        key="list"
        :transactions="transactions"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { MonitorMempools } from "@/module/chaingraph";
import { useStateStore } from "~/store";

const limit = ref(9);
const offset = ref(0);
const stateStore = useStateStore();
const variables = computed(() => ({
	network: stateStore.network,
	offset: offset.value,
	limit: limit.value,
}));

const timestampKey = ref<NodeJS.Timeout | undefined>();
const { onResult, result, loading } = useSubscription(
	MonitorMempools,
	variables,
);

const sortTransactions = () => {
	const node = result.value?.node.at(0);

	// Stop if no data
	if (!node) return [];

	// Sort transactions
	return node.unconfirmed_transactions.map(({ transaction }) => transaction);
};
const transactions = ref<ReturnType<typeof sortTransactions>>([]);

onResult(() => {
	const setTransactions = () => {
		transactions.value = sortTransactions();
		return transactions.value;
	};

	if (transactions.value.length !== limit.value) {
		transactions.value = setTransactions();
	} else {
		if (timestampKey.value) clearTimeout(timestampKey.value);
		timestampKey.value = setTimeout(setTransactions, 5000);
	}
});
</script>
