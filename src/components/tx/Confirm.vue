<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs flex items-center gap-4 transition-colors">
    <Progress :percentage="percentage" />
    <div class="min-w-0 flex-1">
      <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
        Transaction Status
      </div>
      <h4 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5 mb-1 truncate">
        <template v-if="stateStore.lastBlockHeight === '0'">
          Loading...
        </template>
        <template v-else-if="confirm >= 6">
          <span class="text-emerald-600 dark:text-emerald-400">Confirmed</span>
          <span class="text-sm font-normal text-slate-500 dark:text-zinc-400 ml-1.5">({{ confirm }} confirmations)</span>
        </template>
        <template v-else>
          <span class="text-amber-500">Pending</span>
          <span class="text-sm font-normal text-slate-500 dark:text-zinc-400 ml-1.5">({{ confirm }}/6 confirmations)</span>
        </template>
      </h4>
      <div class="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
        <span>Included in block</span>
        <NuxtLink
          :to="`/block/${props.blockHeight}`"
          class="font-mono font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          #{{ numberWithCommas(props.blockHeight) }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { numberWithCommas } from "~/module/utils";
import { useStateStore } from "~/store";

const stateStore = useStateStore();
const props = defineProps<{
	blockHeight: number;
}>();

const confirm = computed(
	() => +stateStore.lastBlockHeight - props.blockHeight + 1,
);
const percentage = computed(() =>
	Math.round(Math.max(Math.min(100, (confirm.value / 6) * 100), 0)),
);
</script>
