<template>
  <TransitionGroup name="list">
    <div
      v-for="transaction in transactions"
      :key="transaction.hash"
      class="transaction-item"
    >
      <div
        class="info p-3"
        @click="
          showOperation.set(
            transaction.hash,
            !showOperation.get(transaction.hash)
          )
        "
      >
        <BaseCopy
          :text="transaction.hash"
          :copy="true"
          :url="`/tx/${transaction.hash}`"
          short
        />
        <small>
          <div v-for="(item, i) in transaction.transfer" :key="i" class="me-1">
            <b class="me-1" v-text="['from', 'to'][i]" />
            <BaseCopy
              v-if="item.type === 'SingleSig'"
              :url="`/address/${item.text}`"
              :text="item.text"
              :copy="false"
              short
            />
            <span v-else v-text="item.text" />
          </div>
        </small>
        <small class="amount text-end">
          {{ satToBch(transaction.amount || 0, 3) }}
          BCH • ${{ appStore.calculatePrice(transaction.amount || "0") }}
        </small>
        <img
          src="~/assets/icons/angle-small-down.svg"
          alt=""
          class="ms-1 angle"
          width="24"
          :style="{
            transform: showOperation.get(transaction.hash)
              ? 'rotate(-180deg)'
              : 'rotate(0deg)',
          }"
        />
      </div>
      <SliderUpDown :active="showOperation.get(transaction.hash)">
        <div class="transaction-list-operation">
          <TransactionListOperation
            name="from"
            :utxos="transaction.inputsUtxo"
            :is-coin-base="transaction.isCoinBase"
          />
          <div class="line" />
          <TransactionListOperation name="to" :utxos="transaction.outputs" />
        </div>
      </SliderUpDown>
    </div>
  </TransitionGroup>
</template>

<script lang="ts">
import type { Utxo } from "~/types";

export type inputs = Array<{
  outpoint?: Utxo | null;
}>;
export type transactions = Array<{
  __typename?: "transaction";
  hash: string;
  input_value_satoshis?: string | null;
  output_value_satoshis?: string | null;
  is_coinbase: boolean;
  inputs: inputs;
  outputs: Array<Utxo>;
}>;
</script>

<script setup lang="ts">
import { removeAddressPrefix, satToBch } from "~/module/bitcoin";
import { useAppStore } from "~/store";

const props = defineProps<{
  transactions: transactions;
}>();
const appStore = useAppStore();

const getTransferAddress = (utxos: Utxo[]) => {
  // remove op_return
  const utxosAddress = utxos.filter(
    ({ locking_bytecode }) => !locking_bytecode.startsWith("6a")
  );

  if (utxosAddress.length === 1) {
    return appStore.lockingBytecodeHexToCashAddress(
      utxosAddress.at(0)?.locking_bytecode.substring(2) || ""
    );
  }
};
const getFrom = (inputs: inputs, isCoinBase: boolean) => {
  if (isCoinBase) {
    return {
      type: "Block Reward" as const,
      text: "Block Reward",
    };
  } else {
    const address = getTransferAddress(
      inputs.map(({ outpoint }) => outpoint).filter(Boolean)
    );

    if (address) {
      return {
        type: "SingleSig" as const,
        text: removeAddressPrefix(address),
      };
    } else {
      return {
        type: "MultiSig" as const,
        text: `${inputs.length} Inputs`,
      };
    }
  }
};
const getTo = (utxos: Utxo[]) => {
  const address = getTransferAddress(utxos);

  if (address) {
    return {
      type: "SingleSig" as const,
      text: removeAddressPrefix(address),
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
    const transfer = [
      getFrom(transaction.inputs, transaction.is_coinbase),
      getTo(transaction.outputs),
    ];

    return {
      hash,
      amount,
      transfer,
      inputsUtxo: transaction.inputs
        .map(({ outpoint }) => outpoint)
        .filter(Boolean),
      outputs: transaction.outputs,
      isCoinBase: transaction.is_coinbase,
    };
  });
});
</script>

<style scoped lang="scss">
.transaction-item {
  > .info {
    cursor: pointer;
    border: var(--bs-border-color) solid 1px;
    border-width: 1px 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr) auto;
    align-items: center;
  }

  .line {
    width: 1px;
    background-color: var(--bs-border-color);
  }

  .angle {
    transition: transform 0.5s;
  }

  .transaction-list-operation {
    border-width: 1px 0;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
  }
}
</style>
