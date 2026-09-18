<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-colors">
    <div class="shrink-0 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
      <bcmr-icon :token-category="category" :size="56" />
    </div>
    <div class="min-w-0 flex-1 text-center sm:text-left">
      <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1 truncate" v-text="tokenName" />
      <BaseCopy :text="category" copy warp />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IdentitySnapshot } from "~/types";

const props = defineProps<{
	identitySnapshot?: IdentitySnapshot;
	category: string;
	loading: boolean;
}>();
const tokenName = computed(() => {
	const name = props.identitySnapshot?.name;
	const isNameEmpty = !name;

	if (isNameEmpty && props.loading) {
		return "Loading...";
	}

	return name || "Unnamed Token";
});
</script>
