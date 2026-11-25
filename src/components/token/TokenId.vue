<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-colors">
    <bcmr-icon class="shrink-0" :token-category="category" :identity-snapshot="identitySnapshot || null" :size="56" />
    <div class="min-w-0 flex-1 text-center sm:text-left">
      <div v-if="nameLoading" role="status" class="mb-2 flex justify-center sm:justify-start">
        <span class="sr-only">Loading</span>
        <Skeleton class="h-5 w-40" />
      </div>
      <h2 v-else class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1 truncate" v-text="tokenName" />
      <BaseCopy :text="category" copy warp />
    </div>
    <div v-if="$slots.default" class="shrink-0 self-center">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IdentitySnapshot } from "~/types";

const props = defineProps<{
	identitySnapshot?: IdentitySnapshot | null;
	category: string;
	loading: boolean;
}>();
const nameLoading = computed(
	() => !props.identitySnapshot?.name && props.loading,
);
const tokenName = computed(
	() => props.identitySnapshot?.name || "Unnamed Token",
);
</script>
