<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out overflow-hidden"
    leave-active-class="transition-all duration-200 ease-in overflow-hidden"
    enter-from-class="max-h-0 opacity-0"
    enter-to-class="max-h-16 opacity-100"
    leave-from-class="max-h-16 opacity-100"
    leave-to-class="max-h-0 opacity-0"
  >
    <div
      v-if="!isHomePage"
      class="w-full bg-slate-900 dark:bg-zinc-900 border-b border-slate-800 dark:border-zinc-800/80 shadow-inner"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3">
        <button
          type="button"
          class="text-slate-400 hover:text-emerald-400 transition-colors p-1"
          aria-label="Search"
          @click="search"
        >
          <i class="uicon-search text-base" />
        </button>
        <input
          v-model="query"
          type="text"
          class="flex-1 bg-transparent text-white placeholder-slate-400 text-sm outline-none border-0 focus:ring-0"
          :placeholder="$t('search_placeholder')"
          @keydown="keydownHandler"
        />
        <kbd class="hidden sm:inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 dark:bg-zinc-800 text-slate-400 border border-slate-700 dark:border-zinc-700">
          Enter
        </kbd>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useSearch } from "~/hooks/search";
const route = useRoute();

const isHomePage = computed(() => route.fullPath === "/");
const { query, search } = useSearch();

function keydownHandler(event: KeyboardEvent) {
	if (event.key === "Enter") {
		search();
	}
}
</script>
