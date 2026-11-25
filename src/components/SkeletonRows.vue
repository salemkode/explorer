<template>
  <div role="status" aria-busy="true" class="divide-y divide-slate-100 dark:divide-zinc-800/60">
    <span class="sr-only">Loading</span>
    <div
      v-for="i in rows"
      :key="i"
      aria-hidden="true"
      class="flex items-center justify-between gap-4 px-5 py-4"
    >
      <Skeleton class="h-4 w-1/3" />
      <Skeleton class="h-3.5 w-1/5 hidden sm:block" />
      <Skeleton class="h-4 w-20 ml-auto" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 5 });
</script>
