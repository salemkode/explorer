<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs transition-colors">
    <LoadingSpinner v-if="props.loading" class="py-8" />
    <template v-else-if="existItems.length">
      <slot name="header"></slot>
      <div class="divide-y divide-slate-100 dark:divide-zinc-800/80">
        <div
          v-for="(item, index) in existItems"
          :key="index"
          class="py-3 first:pt-0 last:pb-0"
        >
          <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1" v-text="item.title" />
          <div class="text-sm font-medium text-slate-800 dark:text-zinc-200">
            <BaseCopy
              :url="item.url"
              :text="item.text"
              :copy="!!item.copy"
              :warp="item.warp"
            />
          </div>
        </div>
      </div>

      <NuxtLink
        v-if="tokenCategory"
        class="mt-5 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 text-slate-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-800 text-sm font-semibold transition-all cursor-pointer"
        :to="`/token/${tokenCategory}`"
      >
        <span>Open Token Page</span>
        <span class="text-xs">→</span>
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { contentWarpItem } from "@/types";
const props = defineProps({
	items: {
		type: Array as PropType<contentWarpItem[]>,
		required: true,
	},
	loading: {
		type: Boolean,
		required: true,
		default: false,
	},
	tokenCategory: {
		type: String,
		required: false,
		default: "",
	},
});

const existItems = computed(() => {
	return props.items.filter((item) => item.text);
});
</script>
