<template>
  <div
    v-if="loading || error || items.length"
    class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors"
  >
    <!-- Header -->
    <div class="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
      <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span>{{ $t("nft_gallery") }}</span>
      </h3>
      <BasePagination
        v-show="hasPrevPage || hasNextPage"
        :has-prev-page="hasPrevPage"
        :has-next-page="hasNextPage"
        @next="emit('next')"
        @previous="emit('previous')"
      />
    </div>

    <div v-if="error" class="p-8 text-center text-sm text-rose-500">
      {{ error }}
    </div>

    <div v-else class="p-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <article
          v-for="item in items"
          :key="`${item.category}:${item.capability || 'none'}:${item.commitment || ''}`"
          class="group bg-slate-50/50 dark:bg-zinc-800/40 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 p-3.5 hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col"
        >
          <div class="w-full aspect-square rounded-lg bg-white dark:bg-zinc-900 flex items-center justify-center p-3 mb-3 border border-slate-100 dark:border-zinc-700/40 overflow-hidden shrink-0">
            <bcmr-icon
              :token-category="item.category"
              :capability="item.capability || undefined"
              :commitment="item.commitment"
              :size="140"
              class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate mb-2" :title="item.name">
            {{ item.name }}
          </div>

          <div class="space-y-1.5 text-xs mt-auto pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500">{{ $t("category") }}</span>
              <BaseCopy :text="item.category" :copy="true" :short="true" />
            </div>

            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500">{{ $t("commitment") }}</span>
              <BaseCopy :text="item.commitment || 'N/A'" :copy="!!item.commitment" :short="true" />
            </div>
          </div>
        </article>
      </div>
    </div>

    <LoadingSpinner
      v-if="loading"
      class="py-6"
    />
  </div>
</template>

<script setup lang="ts">
import type { Capability } from "~/types";

export interface ChildNftItem {
	category: string;
	capability?: Capability | null;
	commitment: string;
	address?: string;
	name: string;
}

defineProps<{
	items: ChildNftItem[];
	loading: boolean;
	error?: string;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}>();

const emit = defineEmits<{
	(event: "next"): void;
	(event: "previous"): void;
}>();
</script>
