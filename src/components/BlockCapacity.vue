<template>
  <div class="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 flex flex-col justify-end overflow-hidden shrink-0 shadow-inner">
    <div
      class="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 dark:from-emerald-600 dark:to-emerald-400 transition-all duration-700"
      :style="{ height: size }"
    />
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
      <i class="uicon-block text-xs" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		sizeBytes: number;
		loading?: boolean;
	}>(),
	{
		loading: false,
	},
);

const size = computed(() => {
	if (props.loading) return "0%";
	const percentage = +(props.sizeBytes || 0) / 33_554_432;
	return `${Math.min(100, Math.max(4, percentage))}%`;
});
</script>
