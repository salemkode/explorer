<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="transaction" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Mobile TxConfirm -->
      <div class="lg:hidden col-span-1">
        <TxConfirm
          v-if="transaction.blockHeight"
          :block-height="transaction.blockHeight"
        />
      </div>

      <!-- Left Column: Details & BCMR Info -->
      <div class="lg:col-span-4 space-y-6">
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

      <!-- Right Column: Confirm & Operations (Inputs / Outputs) -->
      <div class="lg:col-span-8 space-y-6">
        <TxConfirm
          v-if="transaction.blockHeight"
          :block-height="transaction.blockHeight"
          class="hidden lg:flex"
        />

        <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs transition-colors">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-zinc-800/80">
            <div>
              <TransactionListOperation
                name="from"
                :utxos="transaction.inputUtxo"
                :is-coin-base="transaction.transaction.is_coinbase"
              />
            </div>
            <div class="pt-6 md:pt-0 md:pl-6">
              <TransactionListOperation
                name="to"
                :utxos="transaction.transaction.outputs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 404 Not Found State -->
    <div v-else-if="Tx && Tx.transaction.length === 0" class="py-16 text-center">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 text-2xl">
        ✕
      </div>
      <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Transaction Not Found</h2>
      <p class="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
        This transaction was not found on the network or has not been broadcasted yet.
      </p>
      <NuxtLink
        to="/"
        class="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Return to Home
      </NuxtLink>
    </div>

    <LoadingView v-else />
  </div>
</template>

<script setup lang="ts">
import { useAuthChains } from "~/hooks/authchains";
import { useUsdPrice } from "~/hooks/usdPrice";
import { decodeAuthChain } from "~/module/bcmr";
import { GetTx } from "~/module/chaingraph";
import { formatDateString } from "~/module/utils";
import { useRegistryStore, useStateStore } from "~/store";

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
	toRef(() => [`\\x${txid.value}` as const]),
);
const authchainElement = computed(() => {
	if (!authchain.value) return;
	return decodeAuthChain(authchain.value, txid.value);
});

const tokenIdentity = computed(() =>
	registryStore.getTokenIdentity(txid.value),
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
		blockHeight,
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
			title: "Transaction Hash",
			text: txid.value as string,
			copy: true,
			warp: true,
		},
		{
			title: "Value",
			text: satoshis ? formatPrice(satoshis) : 0,
		},
		{
			title: "Timestamp",
			text: formatDateString(transaction.value.timestamp),
		},
	];
});
</script>
