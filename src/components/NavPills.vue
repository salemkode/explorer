<template>
  <div class="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 gap-1 my-3">
    <button
      v-for="(item, index) in props.items"
      :key="index"
      type="button"
      class="flex-1 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold text-center transition-all cursor-pointer select-none"
      :class="
        navItem === index
          ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-zinc-700/60'
          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border border-transparent'
      "
      @click="navItem = index"
    >
      <span v-text="$t(item)" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
	items: readonly string[];
	select: number;
}>();

const emit = defineEmits<(event: "update:select", value: number) => void>();

const navItem = computed({
	get() {
		return props.select;
	},
	set(value) {
		emit("update:select", value);
	},
});
</script>
