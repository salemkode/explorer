<template>
  <div
    v-if="typeof address === 'string'"
    class="card p-2 my-2 align-items-start"
  >
    <BaseCopy
      class="small"
      :url="`/address/${address}`"
      :text="removeAddressPrefix(address)"
      copy
      warp
    />
    <span class="my-1"> {{ satToBch(sat || "") }} BCH </span>
    <div v-if="props.tokenCategory" class="d-flex flex-wrap mt-2">
      <div
        v-if="props.tokenCategory && props.tokenAmount"
        class="badge text-bg-dark d-flex align-items-center me-1 mb-1"
      >
        <NuxtLink class="text-white" :to="`/token/${props.tokenCategory}`">
          {{ shortTx(props.tokenCategory) }}
        </NuxtLink>
        <template v-if="+props.tokenAmount">
          <div class="mx-1">•</div>
          {{ +props.tokenAmount }}
          <span v-if="bcmrInfo?.token?.symbol">
            {{ bcmrInfo.token.symbol }}
          </span>
        </template>
      </div>
      <div v-if="props.tokenCommitment" class="badge text-bg-dark me-1 mb-1">
        NFT commitment:
        {{ props.tokenCommitment }}
      </div>
      <div v-if="props.tokenCapability" class="badge text-bg-dark me-1 mb-1">
        {{ props.tokenCapability?.toString() }} nft
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { satToBch, removeAddressPrefix } from "~/module/bitcoin";
import { shortTx } from "~/module/utils";
import { useStateStore, useRegistryStore } from "~/store";
import { GetToken, type GetTokenQuery } from "~/module/chaingraph";
import type { tokenCapability } from "~/types";

const registryStore = useRegistryStore();
const stateStore = useStateStore();
const props = defineProps<{
  address?: string;
  sat: string;
  tokenCategory?: string;
  tokenAmount?: string;
  tokenCommitment?: string;
  tokenCapability?: tokenCapability;
}>();

const bcmrInfo = registryStore.getToken(
  props.tokenCategory || "",
  props.tokenCapability,
  props.tokenCommitment
);
watch(
  toRef(props, "tokenCategory"),
  () => {
    const category = props.tokenCategory;
    if (!category) return;
    const { onResult } = useQuery<GetTokenQuery>(GetToken, {
      network: stateStore.network,
      tokenCategory: [category],
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
  },
  {
    immediate: true,
  }
);
</script>

<style scoped>
.dot {
  width: 6px;
  margin: auto 9px;
  height: 6px;
  background-color: var(--bs-badge-color);
  border-radius: 50%;
  display: inline-block;
}

.small {
  font-size: 14px;
}
</style>
