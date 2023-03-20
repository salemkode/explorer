<template>
  <client-only>
    <div class="card">
      <h3 class="p-3">Last Transaction</h3>
      <LoadingVue v-if="Loading1 && Loading2" class="my-5 py-5" />
      <div v-else-if="transactions && !transactions.length">Not found</div>
      <TableView
        v-else-if="transactions"
        :rows="transactions"
        :columns="['txid', 'amount', 'price']"
      />
    </div>
  </client-only>
</template>

<script setup lang="ts">
import {
  LastTransaction,
  LastTransactionQuery,
  MonitorMempools,
  MonitorMempoolsSubscription,
} from "@/module/chaingraph";
import { tableColumn } from "~/types/index.js";
import { useAppStore } from "~/store";
import { satToBch, calculatePrice } from "~/module/utils";

const appStore = useAppStore();
const variables = computed(() => ({
  network: appStore.network,
}));

const { result: nodeUnconfirmedTx, loading: Loading1 } =
  useSubscription<MonitorMempoolsSubscription>(MonitorMempools, variables);
const { result: lastBlock, loading: Loading2 } = useQuery<LastTransactionQuery>(
  LastTransaction,
  variables
);

const transactions = computed<tableColumn[][] | undefined>(() => {
  const lastBlockTransaction = lastBlock.value?.block[0].transactions || [];
  const unconfirmedTx =
    nodeUnconfirmedTx.value?.node[0].unconfirmed_transactions || [];

  const lastTransaction = Object.assign(
    unconfirmedTx,
    lastBlockTransaction
  ).slice(0, 8);

  return lastTransaction.map(({ transaction }) => {
    const value =
      transaction.input_value_satoshis ||
      transaction.output_value_satoshis ||
      "";
    const hash = transaction.hash.substring(2);
    return [
      {
        text: hash,
        copy: true,
        short: true,
        url: `/tx/${hash}`,
      },
      {
        text: `${satToBch(value)}BCH`,
      },
      {
        text: `${calculatePrice(value, appStore.usdPrice || "0")}$`,
      },
    ];
  });
});
</script>
