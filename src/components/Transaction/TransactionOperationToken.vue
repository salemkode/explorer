<script setup lang="ts">
import { calculateDecimal } from "~/module/bitcoin";
import { shortTx } from "~/module/utils";
import { useRegistryStore } from "~/store";
import type { Capability } from "~/types";
type Maybe<T> = T | undefined | null;

const registryStore = useRegistryStore();
const props = defineProps<{
	tokenAmount: Maybe<string>;
	tokenCapability: Maybe<Capability>;
	tokenCommitment: Maybe<string>;
	category: Maybe<string>;
}>();
const amount = computed(() => {
	if (!props.tokenAmount) return;
	return calculateDecimal(+props.tokenAmount, 0).toString();
});
const metadata = computed(() => {
	if (!props.category) return;
	return registryStore.getToken(props.category).token;
});
</script>

<template>
  <div class="d-flex flex-wrap mt-2">
    <div
      v-if="category && amount"
      class="badge text-bg-dark d-flex align-items-center me-1 mb-1"
    >
      <NuxtLink class="text-white" :to="`/token/${category}`">
        {{ shortTx(category) }}
      </NuxtLink>
      <div class="mx-1">•</div>
      {{ amount !== "0" ? amount : "" }}&nbsp;
      <span>
        {{ metadata?.symbol }}
      </span>
    </div>
    <div v-if="tokenCommitment" class="badge text-bg-dark me-1 mb-1">
      NFT commitment:
      {{ tokenCommitment }}
    </div>
    <div
      v-if="tokenCapability && tokenCapability !== 'none'"
      class="badge text-bg-dark me-1 mb-1"
    >
      {{ tokenCapability }} nft
    </div>
  </div>
</template>
