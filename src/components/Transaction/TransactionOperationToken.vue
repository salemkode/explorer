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
  <div class="flex flex-wrap items-center gap-1.5 mt-2">
    <!-- Fungible Token Badge -->
    <div
      v-if="category && amount"
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700/80"
    >
      <NuxtLink class="font-mono text-emerald-600 dark:text-emerald-400 hover:underline" :to="`/token/${category}`">
        {{ shortTx(category) }}
      </NuxtLink>
      <span class="text-slate-300 dark:text-zinc-600">•</span>
      <span class="font-mono">{{ amount !== "0" ? amount : "" }}</span>
      <span v-if="metadata?.symbol" class="font-bold text-slate-900 dark:text-white">
        {{ metadata.symbol }}
      </span>
    </div>

    <!-- NFT Commitment Badge -->
    <div
      v-if="tokenCommitment"
      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
    >
      <span class="text-[10px] uppercase font-bold tracking-wider opacity-70">NFT:</span>
      <span>{{ tokenCommitment }}</span>
    </div>

    <!-- NFT Capability Badge -->
    <div
      v-if="tokenCapability && tokenCapability !== 'none'"
      class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
    >
      {{ tokenCapability }} nft
    </div>
  </div>
</template>
