<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-3 sm:p-4 shadow-xs flex items-center justify-between gap-2 transition-colors">
    <template v-for="(block, index) in blocks" :key="block.name">
      <!-- Active Current Block -->
      <div
        v-if="index === 1"
        class="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
      >
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <i class="uicon-block text-sm sm:text-base" />
        </div>
        <div>
          <div class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
            Current Block
          </div>
          <div class="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            #{{ block.height }}
          </div>
        </div>
      </div>

      <!-- Previous / Next Links -->
      <NuxtLink
        v-else
        :to="block.height === -1 ? undefined : `/block/${block.height}`"
        class="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-all"
        :class="{
          'opacity-30 pointer-events-none': block.height === -1,
        }"
      >
        <i
          v-if="index === 0"
          class="uicon-angle-small-left text-base shrink-0"
        />
        <div :class="index === 2 ? 'text-right' : 'text-left'">
          <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            {{ block.name }}
          </div>
          <div class="font-mono text-xs font-medium text-slate-700 dark:text-zinc-300">
            {{ block.height !== -1 ? `#${block.height}` : '—' }}
          </div>
        </div>
        <i
          v-if="index === 2"
          class="uicon-angle-small-right text-base shrink-0"
        />
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useStateStore } from "~/store";

const stateStore = useStateStore();
const props = defineProps<{
	height: string;
}>();
const blocks = computed(() => [
	{
		name: "Previous",
		height: +props.height - 1,
	},
	{
		name: "Current",
		height: +props.height,
	},
	{
		name: "Next",
		height:
			stateStore.lastBlockHeight === props.height ? -1 : +props.height + 1,
	},
]);
</script>
