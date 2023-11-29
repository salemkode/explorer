<template>
  <div class="transaction-list card">
    <h3 class="p-3 justify-content-between d-flex">
      Last transaction
      <BasePagination
        :has-next-page="hasNextPage"
        :has-prev-page="hasPrevPage"
        @next="offset += limit"
        @previous="offset -= limit"
      />
    </h3>
    <Transition name="fade" mode="out-in">
      <LoadingSpinner v-if="loading" class="m-auto my-5" />
      <div
        v-else-if="transactions.length === 0 || error"
        class="text-center my-5 py-5"
      >
        Not Found Transactions
      </div>
      <TransactionList v-else :transactions="transactions" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { history } from "electrum-cash";
import {
  type GetTransactionsQuery,
  GetTransactions,
} from "~/module/chaingraph";
import { useStateStore } from "~/store";

const limit = ref(8);
const offset = ref(0);
const stateStore = useStateStore();
const props = defineProps<{
  history: history;
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
  } else {
    return props.history.slice().sort((tx1, tx2) => tx2.height - tx1.height);
  }
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
