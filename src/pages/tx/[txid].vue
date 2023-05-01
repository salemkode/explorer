<!-- eslint-disable vue/no-useless-template-attributes -->
<template>
  <div v-if="transaction" class="tx-page d-lg-grid container mx-auto">
    <TxConfirm
      v-if="transaction.blockHeight"
      :block-height="transaction.blockHeight"
      class="d-lg-none mt-3 mb-4"
    />
    <div class="column">
      <content-warp :loading="TxLoading" :items="infoContent" />
      <bcmr-info
        :loading="TokenLoading || bcmrToken.value.loading"
        :identity-snapshot="bcmrToken.value.identity"
        :token-category="txid as string"
      />
    </div>
    <div class="column">
      <TxConfirm
        v-if="transaction.blockHeight"
        :block-height="transaction.blockHeight"
        class="d-none d-lg-block"
      />
      <div class="operation d-lg-grid">
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
                stateStore.lockingBytecodeHexToCashAddress(
                  input?.outpoint?.locking_bytecode.substring(2) || ''
                )
              "
              :sat="input.value_satoshis || ''"
              :token-amount="input.outpoint?.fungible_token_amount?.toString()"
              :token-category="input.outpoint?.token_category?.substring(2)"
              :token-commitment="
                input.outpoint?.nonfungible_token_commitment?.substring(2)
              "
              :token-capability="
                input.outpoint?.nonfungible_token_capability || undefined
              "
            />
          </template>
        </div>
        <div>
          <span>Outputs</span>
          <TxOperation
            v-for="(output, index) in transaction.transaction.outputs"
            :key="index"
            :address="
              stateStore.lockingBytecodeHexToCashAddress(
                output.locking_bytecode.substring(2)
              )
            "
            :sat="output.value_satoshis || ''"
            :token-amount="output?.fungible_token_amount?.toString()"
            :token-category="output?.token_category?.substring(2)"
            :token-commitment="
              output?.nonfungible_token_commitment?.substring(2)
            "
            :token-capability="
              output?.nonfungible_token_capability || undefined
            "
          />
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="Tx && Tx.transaction.length === 0">
    This transaction is not found
  </div>
  <LoadingView v-else />
</template>

<script setup lang="ts">
import { useStateStore, useRegistryStore } from "~/store";
import {
  type GetTxQuery,
  type GetTokenQuery,
  GetTx,
  GetToken,
} from "~/module/chaingraph";
import { formatDateString, calculatePrice } from "~/module/utils";
import { satToBch } from "~/module/bitcoin";

const route = useRoute();
const txid = toRef(route.params, "txid");
const stateStore = useStateStore();
const variables = computed(() => ({
  network: stateStore.network,
  hash: "\\x" + txid.value,
}));

/* Getting token info */
const registryStore = useRegistryStore();
const { result: Token, loading: TokenLoading } = useQuery<GetTokenQuery>(
  GetToken,
  computed(() => ({
    network: stateStore.network,
    tokenCategory: ["\\x" + txid.value],
  }))
);
const opreturn = computed(() => {
  const outputs = Token.value?.transaction.at(0)?.outputs;
  return outputs
    ?.find((vout) => vout.locking_bytecode.startsWith("\\x6a"))
    ?.locking_bytecode.substring(2);
});
const bcmrToken = computed(() => {
  const result = registryStore.getTokenOpreturn(
    txid.value as string,
    opreturn.value || ""
  );

  return result;
});

/* Getting transaction info */
const {
  result: Tx,
  loading: TxLoading,
  onError,
  onResult,
} = useQuery<GetTxQuery>(GetTx, variables);

const transaction = computed(() => {
  const node = Tx.value?.node.at(0);
  const unconfirmedTransactions =
    node?.unconfirmed_transactions.at(0)?.transaction;
  let transaction = Tx.value?.transaction.at(0) || unconfirmedTransactions;
  let block = transaction?.block_inclusions.at(0)?.block;
  let blockHeight = block ? +block.height : undefined;

  if (unconfirmedTransactions) {
    transaction = unconfirmedTransactions;
    block = node.accepted_blocks.at(0)?.block;
    if (block) blockHeight = +block.height + 1;
  }
  if (!transaction) return transaction;
  return {
    blockHeight, // TODO: fix not work when block not found app store will update last block height
    timestamp: block ? new Date(+block.timestamp * 1000) : new Date(),
    transaction,
  };
});
onError(() => {
  throw showError({
    statusCode: 404,
    message: "This transaction is not found",
  });
});
onResult(() => {
  if (!transaction.value || !transaction.value.transaction) {
    throw showError({
      statusCode: 404,
      message: "This transaction is not found",
    });
  }
});
const infoContent = computed(() => {
  if (!transaction.value) return [];
  const satoshis: string | null | undefined =
    transaction.value.transaction.input_value_satoshis ||
    transaction.value.transaction.output_value_satoshis;
  const bchValue = satoshis ? `${satToBch(satoshis)}BCH` : "Unknown";
  const usdValue = satoshis
    ? `${calculatePrice(satoshis, stateStore.usdPrice || "")}USD`
    : "Unknown";
  return [
    {
      title: "Transaction hash",
      text: txid.value as string,
      copy: true,
      warp: true,
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
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
</style>
