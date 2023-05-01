<template>
  <div class="px-3">
    <b class="d-block py-2" v-text="$t(props.name)" />
    <ul class="mb-0 nav flex-column text-break">
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
            <BaseCopy
              v-if="utxo.type === 'p2pkh'"
              :text="utxo.address"
              :url="`/address/${utxo.address}`"
              warp
              copy
            />
            <b v-else-if="utxo.type === 'op_return'">
              OP_RETURN {{ utxo.data }}
            </b>
            <b v-else-if="utxo.type === 'coinbase'"> Block Reward </b>
            <div class="amount">
              {{ utxo.value }}
              BCH • ${{ stateStore.calculatePrice(utxo.valueSatoshis || "0") }}
            </div>
            <template v-if="'category' in utxo && utxo.category">
              <div>
                <BaseCopy
                  :text="utxo.category"
                  :url="`/token/${utxo.category}`"
                  short
                  :copy="false"
                />
                • {{ utxo.tokenAmount }}
                {{ registryStore.getToken(utxo.category)?.token?.symbol }}
              </div>
              <div class="d-flex flex-wrap mt-2">
                <div
                  v-if="utxo.category && utxo.tokenAmount"
                  class="badge text-bg-dark d-flex align-items-center me-1 mb-1"
                >
                  <NuxtLink class="text-white" :to="`/token/${utxo.category}`">
                    {{ shortTx(utxo.category) }}
                  </NuxtLink>
                  <template v-if="+utxo.tokenAmount">
                    <div class="mx-1">•</div>
                    {{ +utxo.tokenAmount }}&nbsp;
                    <span>
                      {{ registryStore.getToken(utxo.category)?.token?.symbol }}
                    </span>
                  </template>
                </div>
                <div
                  v-if="utxo.tokenCommitment"
                  class="badge text-bg-dark me-1 mb-1"
                >
                  NFT commitment:
                  {{ utxo.tokenCommitment }}
                </div>
                <div
                  v-if="utxo.tokenCapability"
                  class="badge text-bg-dark me-1 mb-1"
                >
                  {{ utxo.tokenCapability }} nft
                </div>
              </div>
            </template>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { binToUtf8, hexToBin } from "@bitauth/libauth";
import { removeAddressPrefix, satToBch } from "~/module/bitcoin";
import { GetToken, type GetTokenQuery } from "~/module/chaingraph";
import { shortTx } from "~/module/utils";
import { useStateStore, useRegistryStore } from "~/store";
import type { Utxo } from "~/types";

const stateStore = useStateStore();
const registryStore = useRegistryStore();
const props = defineProps<{
  name: "from" | "to";
  utxos: Utxo[];
  isCoinBase?: boolean;
}>();

watch(
  props,
  () => {
    if (props.utxos.length) {
      props.utxos.forEach((utxo) => {
        const category = utxo.token_category;
        if (category) {
          const { onResult } = useQuery<GetTokenQuery>(GetToken, {
            network: stateStore.network,
            tokenCategory: category,
          });

          onResult((tokenTransaction) => {
            const outputs = tokenTransaction.data?.transaction.at(0)?.outputs;
            const opreturn = outputs
              ?.find((vout) => vout.locking_bytecode.startsWith("\\x6a"))
              ?.locking_bytecode.substring(2);

            if (opreturn) {
              registryStore.addToken(category.substring(2), opreturn);
            }
          });
        }
      });
    }
  },
  {
    immediate: true,
  }
);
const utxos = computed(() => {
  if (props.name === "from" && props.isCoinBase === true) {
    return [
      {
        type: "coinbase" as const,
        value: "0",
        valueSatoshis: "0",
      },
    ];
  }
  return props.utxos.map((utxo) => {
    // check is op_return
    if (utxo?.locking_bytecode?.startsWith("\\x6a")) {
      return {
        type: "op_return" as const,
        data: binToUtf8(hexToBin(utxo.locking_bytecode.substring(4))),
        valueSatoshis: utxo.value_satoshis,
        value: satToBch(utxo.value_satoshis || 0, 3),
      };
    }

    const category = utxo.token_category?.substring(2);

    return {
      type: "p2pkh" as const,
      category,
      address: getAddress(utxo?.locking_bytecode || ""),
      valueSatoshis: utxo.value_satoshis,
      value: satToBch(utxo.value_satoshis || 0, 3),
      tokenRegister:
        utxo.token_category &&
        registryStore.getToken(utxo.token_category?.substring(2)),
      tokenAmount: utxo.fungible_token_amount,
      tokenCommitment: utxo.nonfungible_token_commitment?.substring(2),
      tokenCapability: utxo.nonfungible_token_capability,
    };
  });
});
const getAddress = (lockingBytecode: string) => {
  return removeAddressPrefix(
    stateStore.lockingBytecodeHexToCashAddress(lockingBytecode.substring(2)) ||
      ""
  );
};
</script>
