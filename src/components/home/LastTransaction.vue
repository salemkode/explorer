<template>
  <client-only>
    <div v-if="transactions" class="card px-3">
      <h3 class="pt-3">Last Transaction</h3>
      <TableView
        :rows="transactions"
        :columns="['txid', 'amount', 'price']"
      ></TableView>
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { LastTransaction, LastTransactionQuery } from "@/module/chaingraph";
import { tableColumn } from "~~/src/types/table";
import { useSettingStore } from "~/store";
import { satToBch, calculatePrice } from "~~/src/module/utils";

const settingStore = useSettingStore();
const variables = computed(() => ({
  network: settingStore.network,
}));

const { result } = useQuery<LastTransactionQuery>(LastTransaction, variables);

const transactions = computed<tableColumn[][] | undefined>(() =>
  result.value?.block[0].transactions.map(({ transaction }) => {
    const value = transaction.input_value_satoshis;
    const hash = transaction.hash.substring(2);
    return [
      {
        text: hash,
        copy: true,
        short: true,
        url: `/tx/${hash}`,
      },
      {
        text: `${satToBch(value)} BCH`,
      },
      {
        text: `${calculatePrice(value, settingStore.usdPrice || "0")} $`,
      },
    ];
  })
);
</script>
