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
            <BaseCopy
              v-if="utxo.type === 'p2pkh'"
              :text="utxo.address"
              warp
              copy
            />
            <b v-else>OP_RETURN {{ utxo.value }}</b>
            <div class="amount">
              {{ utxo.value }}
              BCH • ${{ appStore.calculatePrice(utxo.valueSatoshis || "0") }}
            </div>
            <div v-if="utxo.category">
              <BaseCopy
                :text="utxo.category"
                :url="`/token/${utxo.category}`"
                short
                :copy="false"
              />
              • {{ utxo.tokenAmount }}
              {{ bcmrStore.getToken(utxo.category)?.token?.symbol }}
            </div>
            <div v-if="utxo.category" class="d-flex flex-wrap mt-2">
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
                    {{ bcmrStore.getToken(utxo.category)?.token?.symbol }}
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
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { binToUtf8, hexToBin } from "@bitauth/libauth";
import { GetToken, type GetTokenQuery } from "~/module/chaingraph";
import { removeAddressPrefix, satToBch, shortTx } from "~/module/utils";
import { useAppStore, useBcmrStore } from "~/store";
import type { utxo } from "~/types";

const appStore = useAppStore();
const bcmrStore = useBcmrStore();
const props = defineProps<{
  name: "from" | "to";
  utxos: utxo[];
}>();

watch(
  props,
  () => {
    if (props.utxos.length) {
      props.utxos.forEach((utxo) => {
        const category = utxo.token_category;
        if (category) {
          const { onResult } = useQuery<GetTokenQuery>(GetToken, {
            network: appStore.network,
            tokenCategory: category,
          });

          onResult((tokenTransaction) => {
            const outputs = tokenTransaction.data?.transaction.at(0)?.outputs;
            const opreturn = outputs
              ?.find((vout) => vout.locking_bytecode.startsWith("\\x6a"))
              ?.locking_bytecode.substring(2);

            if (opreturn) {
              bcmrStore.addToken(category.substring(2), opreturn);
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

    const category = utxo.token_category?.substring(2);

    return {
      // ...utxo,
      type: "p2pkh" as const,
      category,
      address: getAddress(utxo?.locking_bytecode || ""),
      valueSatoshis: utxo.value_satoshis,
      value: satToBch(utxo.value_satoshis || 0, 3),
      tokenAmount: utxo.fungible_token_amount,
      tokenCommitment: utxo.nonfungible_token_commitment?.substring(2),
      tokenCapability: utxo.nonfungible_token_capability,
    };
  })
);
const getAddress = (lockingBytecode: string) => {
  return removeAddressPrefix(
    appStore.lockingBytecodeHexToCashAddress(lockingBytecode.substring(2)) || ""
  );
};
</script>
