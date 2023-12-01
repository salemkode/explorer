<template>
  <Transition name="fade" mode="out-in">
    <div :key="key">
      <div
        v-for="transaction in transactions"
        :key="transaction.hash"
        class="transaction-item"
      >
        <div
          class="content-warp d-flex p-3 w-100 pointer"
          @click="
            showOperation.set(
              transaction.hash,
              !showOperation.get(transaction.hash)
            )
          "
        >
          <div class="content w-100">
            <BaseCopy
              :text="transaction.hash"
              :copy="true"
              :url="`/tx/${transaction.hash}`"
              class="d-flex align-items-center"
              short
            />
            <small>
              <div
                v-for="(item, i) in transaction.transfer"
                :key="i"
                class="me-1"
              >
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
            <small class="amount">
              {{ stateStore.formatPrice(transaction.amount || "0") }}
            </small>
          </div>
          <i
            class="uicon-angle-small-down uicon-md ms-2 angle"
            :style="{
              transform: showOperation.get(transaction.hash)
                ? 'rotate(-180deg)'
                : 'rotate(0deg)',
            }"
          />
        </div>

        <SliderUpDown :active="showOperation.get(transaction.hash)">
          <div class="transaction-list-operation d-lg-grid">
            <TransactionListOperation
              name="from"
              :utxos="transaction.inputsUtxo"
              :is-coin-base="transaction.isCoinBase"
            />
            <div class="line d-none d-lg-block" />
            <div class="line-row d-lg-none" />
            <TransactionListOperation name="to" :utxos="transaction.outputs" />
          </div>
        </SliderUpDown>
      </div>
    </div>
  </Transition>
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
import { removeAddressPrefix } from "~/module/bitcoin";
import { useStateStore } from "~/store";

const key = ref(0);
const props = defineProps<{
  transactions: transactions;
}>();
watch(props, () => {
  key.value += 1;
});

const stateStore = useStateStore();

const getTransferAddress = (utxos: Utxo[]) => {
  // remove op_returns
  const utxosAddress = utxos.filter(
    ({ locking_bytecode }) => !locking_bytecode.startsWith("6a")
  );

  if (utxosAddress.length === 1) {
    return stateStore.lockingBytecodeHexToCashAddress(
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
$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px,
) !default;
@import "node_modules/bootstrap/scss/mixins";
@media (min-width: map-get($grid-breakpoints, md)) {
  .transaction-item .content {
    grid-template-columns: repeat(3, 1fr) auto;

    .amount {
      text-align: end;
    }
  }
}

.transaction-item {
  .content-warp {
    border: var(--bs-border-color) solid 1px;
    border-width: 1px 0;

    .content {
      display: grid;
      gap: 10px;
      align-items: center;
    }
  }

  .line {
    width: 1px;
    background-color: var(--bs-border-color);
  }

  .line-row {
    height: 1px;
    background-color: var(--bs-border-color);
  }

  .angle {
    transition: transform 0.5s;
  }

  .transaction-list-operation {
    border-width: 1px 0;
    grid-template-columns: 1fr auto 1fr;
  }
}
</style>
