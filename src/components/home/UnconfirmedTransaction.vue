<template>
  <TableView
    title="Unconfirmed Transaction"
    :rows="transactions"
    :columns="['txid', 'amount', 'price']"
    :has-prev-page="!!offset"
    :has-next-page="!!hasNextPage"
    :loading="loading"
    :error="error?.message"
    @next="offset += 8"
    @previous="offset -= 8"
  />
</template>

<script setup lang="ts">
import {
  MonitorMempools,
  MonitorMempoolsSubscription,
} from "@/module/chaingraph";
import { tableColumn } from "~/types/index.js";
import { useAppStore } from "~/store";
import { satToBch, calculatePrice } from "~/module/utils";

const limit = ref(9);
const offset = ref(0);
const appStore = useAppStore();
const variables = computed(() => ({
  network: appStore.network,
  offset: offset.value,
  limit: limit.value,
}));

const {
  result: nodeUnconfirmedTx,
  error,
  loading,
} = useSubscription<MonitorMempoolsSubscription>(MonitorMempools, variables);
const hasNextPage = computed(() => {
  if (nodeUnconfirmedTx.value) {
    return (
      nodeUnconfirmedTx.value.node.at(0)?.unconfirmed_transactions.length ===
      limit.value
    );
  }
  return false;
});

const transactions = computed<tableColumn[][]>(() => {
  const unconfirmedTx =
    nodeUnconfirmedTx.value?.node.at(0)?.unconfirmed_transactions || [];

  return unconfirmedTx.map(({ transaction }) => {
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
