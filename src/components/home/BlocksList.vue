<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <i class="uicon-block text-emerald-600 dark:text-emerald-400 text-lg" />
        <h3 class="text-base font-bold text-slate-900 dark:text-white">
          Latest Blocks
        </h3>
      </div>
      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live
      </span>
    </div>

    <!-- Stale Warning -->
    <p v-if="isDataStale" class="mx-4 my-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 leading-relaxed" role="status">
      The data provider has not indexed a block in over two hours. Blocks and transaction confirmations may be out of date.
    </p>

    <!-- Error State -->
    <div v-if="blockList.type == 'error'" class="py-12 text-center text-sm text-slate-400 dark:text-zinc-500">
      Unable to load blocks
    </div>

    <!-- Blocks Content -->
    <div v-else ref="element">
      <Transition name="fade" mode="out-in">
        <!-- Skeleton Loading State -->
        <div
          v-if="blockList.type === 'loading'"
          key="loading"
          class="divide-y divide-slate-100 dark:divide-zinc-800/60"
        >
          <div
            v-for="i in variables.limit"
            :key="i"
            class="flex items-center gap-3.5 px-5 py-3 animate-pulse"
          >
            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-200 dark:bg-zinc-800 shrink-0" />
            <div class="flex-1 min-w-0 space-y-2">
              <div class="h-4 bg-slate-200 dark:bg-zinc-800 rounded-md w-24" />
              <div class="h-3 bg-slate-100 dark:bg-zinc-800/60 rounded-md w-36" />
            </div>
            <div class="text-right space-y-2">
              <div class="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-md w-14 ml-auto" />
              <div class="h-3 bg-slate-100 dark:bg-zinc-800/60 rounded-md w-12 ml-auto" />
            </div>
          </div>
        </div>

        <!-- Loaded Blocks with Smooth List Transitions -->
        <div
          v-else-if="blockList.type === 'loaded'"
          key="loaded"
          class="relative overflow-hidden"
        >
          <TransitionGroup
            name="list"
            tag="div"
            class="relative divide-y divide-slate-100 dark:divide-zinc-800/60"
          >
            <NuxtLink
              v-for="block in blockList.value"
              :key="block.height"
              :to="`/block/${block.height}`"
              class="group flex items-center gap-3.5 px-5 py-3 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <BlockCapacity :size-bytes="+block.size_bytes" />

              <div class="flex-1 min-w-0 flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div class="font-mono text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    #{{ numberWithCommas(block.height) }}
                  </div>
                  <div class="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                    {{ formatDateString(new Date(1000 * +block.timestamp)) }}
                  </div>
                </div>

                <div class="text-right shrink-0">
                  <div class="text-xs font-semibold font-mono text-slate-700 dark:text-zinc-300">
                    {{ block.transaction_count }} Txs
                  </div>
                  <div class="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5">
                    {{ bytesToMB(+block.size_bytes) }} MB
                  </div>
                </div>
              </div>
            </NuxtLink>
          </TransitionGroup>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GetBlocks } from "~/module/chaingraph";
import { bytesToMB, formatDateString, numberWithCommas } from "~/module/utils";
import { useStateStore } from "~/store";

const element = ref<HTMLDivElement | null>(null);
const stateStore = useStateStore();
const variables = computed(() => ({
	limit: 7,
	offset: 0,
	network: stateStore.network,
}));
const { result, loading, error } = useSubscription(GetBlocks, variables);
const isDataStale = computed(() => {
	const timestamp = result.value?.block.at(0)?.timestamp;
	return (
		timestamp && Date.now() - Number(timestamp) * 1000 > 2 * 60 * 60 * 1000
	);
});

// create computed var to create virtual list to loading
const blockList = computed(() => {
	if (result.value) {
		return {
			type: "loaded",
			value: result.value.block,
		} as const;
	}

	if (loading.value) {
		return {
			type: "loading",
			value: [],
		} as const;
	}

	return {
		type: "error",
		value: error.value || undefined,
	} as const;
});
</script>
