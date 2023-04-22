<template>
  <div class="transaction-list card">
    <h3 class="p-3">Last transaction</h3>
    <LoadingSpinner
      v-if="loading && transactions.length === 0"
      class="m-auto"
    />
    <div v-else-if="transactions.length === 0" class="m-auto">
      Not Found unconfirmed transaction
    </div>
    <TransactionList v-else :transactions="transactions" />
  </div>
</template>

<script setup lang="ts">
import {
  type MonitorMempoolsSubscription,
  MonitorMempools,
} from "@/module/chaingraph";
import { useAppStore } from "~/store";

const limit = ref(9);
const offset = ref(0);
const appStore = useAppStore();
const variables = computed(() => ({
  network: appStore.network,
  offset: offset.value,
  limit: limit.value,
}));

const { result: nodeUnconfirmedTx, loading } =
  useSubscription<MonitorMempoolsSubscription>(MonitorMempools, variables);

const transactions = computed(() => {
  return nodeUnconfirmedTx.value?.node.at(0)?.unconfirmed_transactions || [];
});
</script>
