<template>
  <PopperOver placement="auto-end" hover>
    <slot />
    <template #content>
      <div
        class="bg-slate-900/95 dark:bg-zinc-800/95 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-lg border border-slate-700/60 dark:border-zinc-700/60 max-w-xs break-all z-50 pointer-events-none"
        v-text="props.msg"
      />
    </template>
  </PopperOver>
</template>

<script lang="ts" setup>
const PopperOver = defineAsyncComponent({
	loader: () => import("vue3-popper"),
});
const props = defineProps<{ msg: string }>();
</script>
