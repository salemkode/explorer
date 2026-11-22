<script setup lang="ts">
import { computed } from "vue";
import {
	compactTokenBadgeCommitment,
	formatTokenBadgeAmount,
} from "~/module/tokenBadgeDisplay";
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
const registryEntry = computed(() =>
	props.category ? registryStore.getToken(props.category) : undefined,
);
const metadata = computed(() => registryEntry.value?.token);
// The decimals are unknown while metadata loads, so no figure is shown yet.
const metadataLoading = computed(() => !!registryEntry.value?.loading);
const amount = computed(() => {
	if (props.tokenAmount === null || props.tokenAmount === undefined) return;
	return formatTokenBadgeAmount(props.tokenAmount, metadata.value?.decimals ?? 0);
});
</script>

<template>
  <div class="flex flex-wrap items-start gap-1.5 mt-2">
    <!-- Fungible Token Badge -->
    <div
      v-if="category && tokenAmount !== null && tokenAmount !== undefined"
      class="inline-flex max-w-full min-w-0 items-start gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700/80"
    >
      <NuxtLink class="font-mono text-emerald-600 dark:text-emerald-400 hover:underline" :to="`/token/${category}`">
        {{ shortTx(category) }}
      </NuxtLink>
      <span class="text-slate-300 dark:text-zinc-600">•</span>
      <span v-if="metadataLoading" title="Loading token amount">…<span class="sr-only">Loading token amount</span></span>
      <TransactionTokenBadgeValue
        v-else-if="amount"
        :display="amount.display"
        :exact="amount.exact"
        :raw="tokenAmount"
        :label="metadata ? 'Exact token amount' : 'Exact token amount (base units; metadata unavailable)'"
      >
        <span v-if="metadata?.symbol" class="font-bold text-slate-900 dark:text-white">
          {{ metadata.symbol }}
        </span>
      </TransactionTokenBadgeValue>
      <span v-else>Amount unavailable</span>
    </div>

    <!-- NFT Commitment Badge -->
    <div
      v-if="tokenCommitment"
      class="inline-flex max-w-full min-w-0 items-start gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
    >
      <span class="text-[10px] uppercase font-bold tracking-wider opacity-70">NFT:</span>
      <TransactionTokenBadgeValue
        :display="compactTokenBadgeCommitment(tokenCommitment)"
        :exact="tokenCommitment"
        label="Exact NFT commitment"
      />
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
