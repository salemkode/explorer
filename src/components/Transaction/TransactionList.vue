<template>
  <TransitionGroup
    name="list"
    tag="div"
    class="relative divide-y divide-slate-100 dark:divide-zinc-800/60 overflow-hidden"
  >
    <div
      v-for="transaction in transactions"
      :key="transaction.hash"
      class="group"
    >
        <!-- Clickable Header Row -->
        <div
          class="w-full px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors select-none"
          @click="
            showOperation.set(
              transaction.hash,
              !showOperation.get(transaction.hash)
            )
          "
        >
          <div class="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
            <!-- Tx Hash -->
            <div class="md:col-span-4 min-w-0">
              <BaseCopy
                :text="transaction.hash"
                :copy="true"
                :url="`/tx/${transaction.hash}`"
                short
              />
            </div>

            <!-- Transfer Info (from -> to) -->
            <div class="md:col-span-5 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
              <div
                v-for="(item, i) in transaction.transfer"
                :key="i"
                class="inline-flex items-center gap-1"
              >
                <span class="font-semibold text-slate-400 dark:text-zinc-500 capitalize text-[11px]" v-text="['from', 'to'][i]" />
                <BaseCopy
                  v-if="item.type === 'SingleSig'"
                  :url="item.url"
                  :text="item.text"
                  :copy="false"
                  short
                />
                <span v-else class="font-mono text-xs" v-text="item.text" />
              </div>
            </div>

            <!-- Amount -->
            <div class="md:col-span-3 text-left md:text-right font-mono font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
              {{ formatPrice(transaction.amount || "0") }}
            </div>
          </div>

          <!-- Expand / Collapse Arrow -->
          <div class="p-1 rounded-lg text-slate-400 dark:text-zinc-500 group-hover:text-emerald-500 transition-colors shrink-0">
            <i
              class="uicon-angle-small-down text-xs transition-transform duration-300 inline-block"
              :class="{ 'rotate-180': showOperation.get(transaction.hash) }"
            />
          </div>
        </div>

        <!-- Collapsible UTXO Operations -->
        <SliderUpDown :active="showOperation.get(transaction.hash)">
          <div class="bg-slate-50/60 dark:bg-zinc-950/40 border-t border-slate-100 dark:border-zinc-800/80 p-4 sm:p-5">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80 dark:divide-zinc-800/80">
              <TransactionListOperation
                name="from"
                :utxos="transaction.outpoints"
                :is-coin-base="transaction.isCoinBase"
              />
              <TransactionListOperation
                name="to"
                :utxos="transaction.outputs"
                class="pt-4 lg:pt-0 lg:pl-6"
              />
            </div>
          </div>
        </SliderUpDown>
      </div>
  </TransitionGroup>
</template>

<script lang="ts">
import type { Utxo } from "~/types";

export type Inputs = Array<{
	outpoint?: Utxo | null;
}>;
export type Transactions = Array<{
	__typename?: "transaction";
	hash: string;
	input_value_satoshis?: string | null;
	output_value_satoshis?: string | null;
	is_coinbase: boolean;
	inputs: Inputs;
	outputs: Array<Utxo>;
}>;
</script>

<script setup lang="ts">
import { formatLockingBytecodeAddress } from "~/hooks/addressDisplay";
import { useUsdPrice } from "~/hooks/usdPrice";

const props = defineProps<{
	transactions: Transactions;
}>();

const { formatPrice } = useUsdPrice();

const getTransferAddress = (utxos: Utxo[]) => {
  // remove op_returns
  const utxosAddress = utxos.filter(
    ({ locking_bytecode }) => !locking_bytecode.startsWith("6a")
  );

  if (utxosAddress.length === 1) {
    return formatLockingBytecodeAddress(
      utxosAddress.at(0)?.locking_bytecode.substring(2) || ""
    );
  }
};
const getFrom = (outpoints: Utxo[],  isCoinBase: boolean, length: number) => {
  if (isCoinBase) {
    return {
      type: "Block Reward" as const,
      text: "Block Reward",
    };
  } else {
    const address = getTransferAddress(outpoints);

    if (address) {
      return {
        type: "SingleSig" as const,
        text: address,
        url: `/address/${address}`,
      };
    } else {
      return {
        type: "MultiSig" as const,
        text: `${length} Inputs`,
      };
    }
  }
};
const getTo = (utxos: Utxo[]) => {
  const address = getTransferAddress(utxos);

  if (address) {
    return {
      type: "SingleSig" as const,
      text: address,
      url: `/address/${address}`,
    };
  } else {
    return {
      type: "MultiSig" as const,
      text: `${utxos.length} Outputs`,
    };
  }
};
const showOperation = reactive(new Map<string, boolean>());
const transactions = computed(() => {
  return props.transactions.map((transaction) => {
    const amount =
      transaction.output_value_satoshis ||
      transaction.input_value_satoshis ||
      "";
    const hash = transaction.hash.substring(2);
    const outpoints = transaction.inputs
      .map(({ outpoint }) => outpoint)
      .filter(Boolean);
    const transfer = [
      getFrom(outpoints, transaction.is_coinbase, transaction.inputs.length),
      getTo(transaction.outputs),
    ];

    return {
      hash,
      amount,
      transfer,
      outpoints,
      outputs: transaction.outputs,
      isCoinBase: transaction.is_coinbase,
    };
  });
});
</script>
