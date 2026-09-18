<template>
  <div class="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 p-0.5 border border-slate-200/80 dark:border-zinc-700/60">
    <button
      type="button"
      class="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700/80 hover:text-slate-900 dark:hover:text-white hover:shadow-xs transition-all disabled:opacity-25 disabled:pointer-events-none cursor-pointer inline-flex items-center justify-center"
      :disabled="!props.hasPrevPage"
      aria-label="Previous page"
      @click="emit('previous')"
    >
      <i class="uicon-angle-small-left text-sm" />
    </button>
    <button
      type="button"
      class="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700/80 hover:text-slate-900 dark:hover:text-white hover:shadow-xs transition-all disabled:opacity-25 disabled:pointer-events-none cursor-pointer inline-flex items-center justify-center"
      :disabled="!props.hasNextPage"
      aria-label="Next page"
      @click="emit('next')"
    >
      <i class="uicon-angle-small-right text-sm" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
	hasPrevPage: boolean;
	hasNextPage: boolean;
}>();
const emit = defineEmits<{
	(event: "next"): void;
	(event: "previous"): void;
}>();
</script>
