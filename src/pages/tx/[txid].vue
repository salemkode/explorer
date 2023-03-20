<!-- eslint-disable vue/no-useless-template-attributes -->
<template>
  <div v-if="transaction" class="tx-page container mx-auto">
    <div class="column">
      <ContentWarp :items="infoContent" />
      <bcmr-info :token-category="route.params.txid as string" />
    </div>
    <div class="column">
      <TxConfirm :block-height="transaction.blockHeight" />
      <div class="operation">
        <div>
          <span>Inputs</span>
          <div v-if="transaction.transaction.is_coinbase" class="card my-2 p-2">
            CoinBase
          </div>
          <template v-else>
            <TxOperation
              v-for="(input, index) in transaction.transaction.inputs"
              :key="index"
              :address="
                scriptSigToCashAddress(input.unlocking_bytecode.substring(2))
              "
              :sat="input.value_satoshis || ''"
              :token-amount="input.outpoint?.fungible_token_amount?.toString()"
              :token-category="input.outpoint?.token_category?.substring(2)"
            />
          </template>
        </div>
        <div>
          <span>Outputs</span>
          <TxOperation
            v-for="(output, index) in transaction.transaction.outputs"
            :key="index"
            :address="
              lockingBytecodeHexToCashAddress(
                output.locking_bytecode.substring(2)
              )
            "
            :sat="output.value_satoshis || ''"
            :token-amount="output?.fungible_token_amount?.toString()"
            :token-category="output?.token_category?.substring(2)"
          />
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="result && result.transaction.length === 0">
    This transaction is not found
  </div>
  <loading-vue v-else />
</template>

<script setup lang="ts">
import { useAppStore } from "~/store";
import { GetTxQuery, GetTx } from "~/module/chaingraph";
import {
  formatDateString,
  satToBch,
  lockingBytecodeHexToCashAddress,
  scriptSigToCashAddress,
  calculatePrice,
} from "~/module/utils";

const route = useRoute();
const appStore = useAppStore();
const variables = computed(() => ({
  network: appStore.network,
  hash: "\\x" + route.params.txid,
}));

const { result } = useQuery<GetTxQuery>(GetTx, variables);
const transaction = computed(() => {
  const transaction = result.value?.transaction[0];
  const block = transaction?.block_inclusions[0].block;
  if (!transaction) return transaction;
  return {
    blockHeight: block ? +block.height : +appStore.lastBlockHeight + 1,
    timestamp: block ? new Date(+block.timestamp * 1000) : new Date(),
    transaction,
  };
});

const infoContent = computed(() => {
  if (!transaction.value) return [];
  const satoshis: string | null | undefined =
    transaction.value.transaction.input_value_satoshis ||
    transaction.value.transaction.output_value_satoshis;
  const bchValue = satoshis ? `${satToBch(satoshis)}BCH` : "Unknown";
  const usdValue = satoshis
    ? `${calculatePrice(satoshis, appStore.usdPrice || "")}USD`
    : "Unknown";
  return [
    {
      title: "Transaction hash",
      text: route.params.txid as string,
      copy: true,
    },
    {
      title: "Value (BCH)",
      text: bchValue,
    },
    {
      title: "Value (USD)",
      text: usdValue,
    },
    {
      title: "Time",
      text: formatDateString(transaction.value.timestamp),
    },
  ];
});
</script>

<style>
.tx-page {
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  gap: 15px;
}
.tx-page .column {
  overflow-x: hidden;
}
.tx-page .column > * {
  margin-top: 10px;
}
.tx-page .operation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
</style>
