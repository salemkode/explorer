<template>
  <div
    v-if="typeof address === 'string'"
    class="card p-2 my-2 align-items-start"
  >
    <Copy class="small" :text="removeAddressPrefix(address)" copy />
    <span class="my-1"> {{ satToBch(sat || "") }} BCH </span>
    <div v-if="tokenCategory && bcmrInfo" class="d-flex flex-wrap mt-2">
      <div
        v-if="tokenCategory && tokenAmount"
        class="badge text-bg-dark d-flex align-items-center me-1 mb-1"
      >
        <NuxtLink class="text-white" :to="`/token/${tokenCategory}`">
          {{ shortTx(tokenCategory) }}
        </NuxtLink>
        <template v-if="+tokenAmount">
          {{ +tokenAmount }}
          <span v-if="bcmrInfo.token?.symbol" class="dot" />
          {{ bcmrInfo.token?.symbol }}
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
import { satToBch, removeAddressPrefix, shortTx } from "~/module/utils";
import { useAppStore, useBcmrStore } from "~/store";
import { GetToken, GetTokenQuery } from "~/module/chaingraph";
import { IdentitySnapshot } from "~/types";

const bcmrStore = useBcmrStore();
const appStore = useAppStore();
const props = defineProps<{
  address: string | object;
  sat: string;
  tokenCategory?: string;
  tokenAmount?: string;
  tokenCommitment?: string;
  tokenCapability?: string;
}>();
const variable = computed(() => ({
  network: appStore.network,
  tokenCategory: "\\x" + props.tokenCategory,
}));

const bcmrInfo = ref<IdentitySnapshot | undefined>(undefined);
watch(
  toRef(props, "tokenCategory"),
  () => {
    const tokenCategory = props.tokenCategory;
    if (!tokenCategory) return;
    const { onResult } = useQuery<GetTokenQuery>(GetToken, variable);
    onResult((result) => {
      if (!result.data) return;
      if (!result.data) return;
      const opreturn = result.data?.transaction
        .at(0)
        ?.outputs?.find((vout) => vout.locking_bytecode.startsWith("\\x6a"))
        ?.locking_bytecode.substring(2);
      if (!opreturn) return;
      const tokenInfo = bcmrStore.getTokenInfo(tokenCategory, opreturn);
      bcmrInfo.value = tokenInfo.value.identity;
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
