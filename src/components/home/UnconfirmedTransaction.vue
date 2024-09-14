<template>
  <div class="transaction-list card">
    <h3 class="p-3">Latest transactions</h3>
    <LoadingSpinner
      v-if="loading && transactions.length === 0"
      class="m-auto"
    />
    <div v-else-if="transactions.length === 0" class="my-5 py-5 text-center">
      <h5>Not Found unconfirmed transaction</h5>
    </div>
    <TransactionList v-else :transactions="transactions" />
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
