<template>
  <div class="px-3">
    <b class="d-block py-2" v-text="$t(props.name)" />
    <ul class="mb-0 nav flex-column">
      <li
        v-for="(utxo, i) in utxos"
        :key="i"
        class="mb-2 w-100"
        style="font-size: 12.8px"
      >
        <div class="d-flex">
          <b class="pe-2">
            {{ i + 1 }}
          </b>
          <div>
            <Copy v-if="utxo.type === 'p2pkh'" :text="utxo.address" warp copy />
            <b v-else>OP_RETURN {{ utxo.value }}</b>
            <div class="amount">
              {{ satToBch(utxo.value_satoshis || 0, 3) }}
              BCH • ${{ appStore.calculatePrice(utxo.value_satoshis || "0") }}
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { binToUtf8, hexToBin } from "@bitauth/libauth";
import { removeAddressPrefix, satToBch } from "~/module/utils";
import { useAppStore } from "~/store";
import type { utxo } from "~/types";

const appStore = useAppStore();
const props = defineProps<{
  name: "from" | "to";
  utxos: utxo[];
}>();

const utxos = computed(() =>
  props.utxos.map((utxo) => {
    // check is op_return
    if (utxo?.locking_bytecode?.startsWith("\\x6a")) {
      return {
        ...utxo,
        type: "op_return" as const,
        value: binToUtf8(hexToBin(utxo.locking_bytecode.substring(4))),
      };
    }

    return {
      ...utxo,
      type: "p2pkh" as const,
      address: getAddress(utxo?.locking_bytecode || ""),
    };
  })
);
const getAddress = (lockingBytecode: string) => {
  return removeAddressPrefix(
    appStore.lockingBytecodeHexToCashAddress(lockingBytecode.substring(2)) || ""
  );
};
</script>
