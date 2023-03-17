<template>
  <div v-if="transaction" class="tx-page container">
    <div class="card p-3 tx-info">
      <span class="text-body-secondary mb-2">Transaction hash</span>
      <Copy
        text="35220b296dd2cff255d7a6fb49824326774e2153714398342580f848b6a24e6d"
        copy
      />
      <span class="text-body-secondary mb-2">Output</span>
      <span>{{ transaction.transaction.input_value_satoshis }} BCH</span>
      <span class="text-body-secondary mb-2">Time</span>
      {{ transaction.timestamp }}
    </div>
    <div class="py-2 px-3">
      <div class="d-flex">
        <Progress :percentage="50" />
        <div class="px-3">
          <div>Transaction status</div>
          <h4 class="my-2">Confirmed 62 confirmations</h4>
          <h4 class="my-2">Confirmed 1 of 6 confirmations</h4>
          <div>Block id {{ numberWithCommas(transaction.blockHeight) }}</div>
        </div>
      </div>
    </div>
    <pre>{{ transaction }}</pre>
  </div>
  <div v-else>Loading</div>
</template>

<script setup lang="ts">
import { useSettingStore } from "~/store";
import { GetTxQuery, GetTx } from "~/module/chaingraph";
import { numberWithCommas } from "~/module/utils";

const route = useRoute();
const settingStore = useSettingStore();
const variables = computed(() => ({
  network: settingStore.network,
  hash: "\\x" + route.params.txid,
}));

const { result } = useQuery<GetTxQuery>(GetTx, variables);
const transaction = computed(() => {
  const blockTransaction = result.value?.block_transaction[0];
  if (!blockTransaction) return blockTransaction;
  return {
    blockHeight: blockTransaction.block.height,
    timestamp: blockTransaction.block.timestamp,
    transaction: blockTransaction.transaction,
  };
});
</script>

<style scoped>
.tx-page {
  display: grid;
  grid-template-columns: 30% 70%;
  gap: 10px;
  margin-top: 50px;
}
</style>
