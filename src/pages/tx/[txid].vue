<template>
  <div v-if="transaction" class="tx-page d-lg-grid container mx-auto">
    <TxConfirm
      v-if="transaction.blockHeight"
      :block-height="transaction.blockHeight"
      class="d-lg-none mt-3 mb-4"
    />
    <div class="column">
      <content-warp
        :loading="TxLoading"
        :items="infoContent"
        :token-category="authchainElement ? txid : undefined"
      />
      <bcmr-info
        :loading="false"
        :identity-snapshot="tokenIdentity.identity"
        :token-category="txid"
      />
    </div>
    <div class="column">
      <TxConfirm
        v-if="transaction.blockHeight"
        :block-height="transaction.blockHeight"
        class="d-none d-lg-block"
      />
      <div class="operation d-lg-grid">
        <TransactionListOperation
          name="from"
          :utxos="transaction.inputUtxo"
          :is-coin-base="transaction.transaction.is_coinbase"
        />
        <TransactionListOperation
          name="to"
          :utxos="transaction.transaction.outputs"
        />
      </div>
    </div>
  </div>
  <div v-else-if="Tx && Tx.transaction.length === 0" class="container py-5">
    <h2>This transaction is not found</h2>
  </div>
  <LoadingView v-else />
</template>

<script setup lang="ts">
import { useRegistryStore, useStateStore } from "~/store";
import { GetTx } from "~/module/chaingraph";
import { formatDateString } from "~/module/utils";
import { decodeAuthChain } from "~/module/bcmr";
import { useAuthChains } from "~/hooks/authchains";
import { useUsdPrice } from "~/hooks/usdPrice";

const route = useRoute();
const txid = toRef(route.params, "txid") as Ref<string>;
const stateStore = useStateStore();
const { formatPrice } = useUsdPrice();

const variables = computed(() => ({
  network: stateStore.network,
  hash: `\\x${txid.value}` as const,
}));

/* Getting token info */
const registryStore = useRegistryStore();
const { result: authchain } = useAuthChains(
  toRef(() => [`\\x${txid.value}` as const])
);
const authchainElement = computed(() => {
  if (!authchain.value) return;
  return decodeAuthChain(authchain.value, txid.value);
});

const tokenIdentity = computed(() =>
  registryStore.getTokenIdentity(txid.value)
);

/* Getting transaction info */
const {
  result: Tx,
  loading: TxLoading,
  onError,
  onResult,
} = useQuery(GetTx, variables);

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
    inputUtxo: transaction.inputs
      .map(({ outpoint }) => outpoint)
      .filter(Boolean),
  };
});

onError(() => {
  throw showError({
    statusCode: 404,
    message: "This transaction is not found",
  });
});

onResult(() => {
  if (!TxLoading.value && transaction.value === undefined) {
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
  return [
    {
      title: "Transaction hash",
      text: txid.value as string,
      copy: true,
      warp: true,
    },
    {
      title: "Value",
      text: satoshis ? formatPrice(satoshis) : 0,
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
