<template>
  <button
    type="button"
    aria-haspopup="dialog"
    class="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-200 hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500"
  >
    <svg aria-hidden="true" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
    Auth chain
    <span v-if="count !== undefined" class="text-xs text-slate-500 dark:text-zinc-400">{{ count }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{ count?: number }>();
</script>
