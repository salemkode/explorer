<template>
  <section aria-labelledby="network-status-heading" class="mb-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
    <div class="px-5 pt-4 flex flex-wrap items-center justify-between gap-3">
      <h2 id="network-status-heading" class="text-base font-bold text-slate-900 dark:text-white">
        Bitcoin Cash <span class="font-normal text-slate-500 dark:text-zinc-400">/ {{ network === 'mainnet' ? 'Mainnet' : 'Chipnet' }}</span>
      </h2>
      <div class="flex items-center gap-3">
        <span role="status" aria-live="polite" class="inline-flex items-center gap-1.5 text-xs font-semibold" :class="status.type === 'live' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'">
          <span aria-hidden="true" class="w-1.5 h-1.5 rounded-full bg-current" />
          {{ status.label }}
        </span>
        <button v-if="status.type === 'error'" type="button" class="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 cursor-pointer" @click="$emit('retry')">
          Retry connection
        </button>
      </div>
    </div>
    <dl class="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4 px-5 py-5">
      <div class="min-w-0">
        <dt class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Accepted height</dt>
        <dd class="font-mono font-semibold text-lg tabular-nums">
          <NuxtLink v-if="tip" :to="`/block/${tip.height}`" class="text-emerald-700 dark:text-emerald-400 underline decoration-emerald-500/30 underline-offset-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500">#{{ numberWithCommas(tip.height) }}</NuxtLink>
          <Skeleton v-else-if="connecting" class="h-6 w-24" />
          <span v-else class="text-sm text-slate-500 dark:text-zinc-400">{{ placeholder }}</span>
        </dd>
      </div>
      <div class="min-w-0">
        <dt class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Latest block age</dt>
        <dd class="text-sm font-semibold pt-1">
          <time v-if="tip" :datetime="new Date(Number(tip.timestamp) * 1000).toISOString()" :title="new Date(Number(tip.timestamp) * 1000).toUTCString()">{{ blockAge }}</time>
          <Skeleton v-else-if="connecting" class="h-4 w-20" />
          <span v-else class="font-normal text-slate-500 dark:text-zinc-400">{{ placeholder }}</span>
        </dd>
      </div>
      <div class="min-w-0">
        <dt class="text-xs text-slate-500 dark:text-zinc-400 mb-1">Node mempool</dt>
        <dd class="font-mono font-semibold text-lg tabular-nums">
          <template v-if="node && node.unconfirmed_transaction_count != null">{{ numberWithCommas(node.unconfirmed_transaction_count) }} <span class="font-sans text-xs font-normal text-slate-500 dark:text-zinc-400">txs</span></template>
          <Skeleton v-else-if="connecting" class="h-6 w-20" />
          <span v-else class="font-sans text-sm font-normal text-slate-500 dark:text-zinc-400">{{ placeholder }}</span>
        </dd>
      </div>
    </dl>
    <div class="px-5 py-3 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 space-y-1.5">
      <p :class="status.type === 'live' ? '' : 'text-amber-700 dark:text-amber-400'">{{ status.message }}<span v-if="node && status.type !== 'live'"> Showing last received values.</span></p>
      <p class="break-words">Source: {{ source }}<template v-if="node"> / {{ node.name }}</template> <span aria-hidden="true">·</span> {{ checkedAge }}</p>
      <p>Block age uses the miner’s timestamp, which can differ from actual time.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { useNetworkStatus } from "~/composables/useNetworkStatus";
import { numberWithCommas } from "~/module/utils";

const props = defineProps<{
	network: string;
	node: ReturnType<typeof useNetworkStatus>["node"]["value"];
	tip: ReturnType<typeof useNetworkStatus>["tip"]["value"];
	status: ReturnType<typeof useNetworkStatus>["status"]["value"];
	blockAge: string;
	checkedAge: string;
}>();
defineEmits<{ retry: [] }>();
const source = new URL(
	useNuxtApp().$chaingraph?.httpUrl ?? useRuntimeConfig().public.chaingraphHttp,
).host;
const connecting = computed(() => props.status.type === "connecting");
const placeholder = "Unavailable";
</script>
