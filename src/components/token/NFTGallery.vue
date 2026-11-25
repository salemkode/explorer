<template>
  <section :aria-label="$t('nft_gallery')" :aria-busy="loading" class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
    <div class="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex flex-wrap gap-3 items-center justify-between">
      <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ $t("nft_gallery") }}</h3>
      <BasePagination
        v-if="hasPrevPage || hasNextPage"
        :has-prev-page="hasPrevPage && !loading"
        :has-next-page="hasNextPage && !loading && !error"
        @next="emit('next')"
        @previous="emit('previous')"
      />
    </div>

    <div v-if="error" role="alert" class="p-8 text-center text-sm text-rose-600 dark:text-rose-400">
      <p>Could not load NFTs. Try again.</p>
      <p class="mt-2 break-words">{{ error }}</p>
      <button type="button" class="mt-4 rounded-lg border border-current px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2" @click="emit('retry')">Try again</button>
    </div>
    <div v-else-if="loading" role="status" aria-busy="true" class="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      <span class="sr-only">Loading NFTs…</span>
      <div v-for="i in 4" :key="i" class="min-w-0 bg-slate-50/50 dark:bg-zinc-800/40 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 p-3.5">
        <Skeleton class="aspect-square w-full rounded-lg mb-3" />
        <Skeleton class="h-4 w-2/3 mb-4" />
        <Skeleton class="h-3 w-full mb-3" />
        <Skeleton class="h-3 w-1/2" />
      </div>
    </div>
    <p v-else-if="!items.length" role="status" class="p-8 text-center text-sm text-slate-500 dark:text-zinc-400">No NFTs found on this page.</p>
    <div v-else class="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      <article v-for="item in cards" :key="item.id" class="min-w-0 bg-slate-50/50 dark:bg-zinc-800/40 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 p-3.5 flex flex-col">
        <div class="w-full rounded-lg bg-white dark:bg-zinc-900 p-3 mb-3 border border-slate-100 dark:border-zinc-700/40">
          <NFTImage :category="item.category" :name="item.name" :image="item.metadata.token?.image" :icon="item.metadata.token?.icon" :pending="item.metadata.loading" />
        </div>
        <h4 class="font-bold text-sm text-slate-900 dark:text-white break-words mb-2">{{ item.name }}</h4>
        <div v-if="item.metadata.loading" role="status" class="mb-3">
          <span class="sr-only">Loading metadata…</span>
          <Skeleton class="h-3 w-1/2" />
        </div>
        <p v-else-if="!item.metadata.token" class="mb-3 text-xs text-slate-500 dark:text-zinc-400">Metadata unavailable</p>
        <dl class="space-y-3 text-xs mt-auto pt-3 border-t border-slate-100 dark:border-zinc-700/60">
          <div>
            <dt class="mb-1 font-semibold text-slate-500 dark:text-zinc-400">{{ $t("category") }}</dt>
            <dd><BaseCopy :text="item.category" :url="`/token/${item.category}`" :copy="true" :short="true" /></dd>
          </div>
          <div>
            <dt class="mb-1 font-semibold text-slate-500 dark:text-zinc-400">{{ $t("commitment") }}</dt>
            <dd v-if="item.commitment" class="break-all font-mono text-slate-800 dark:text-zinc-200"><BaseCopy :text="item.commitment" :copy="true" :warp="true" /></dd>
            <dd v-else class="text-slate-600 dark:text-zinc-300">Empty commitment</dd>
          </div>
          <div>
            <dt class="mb-1 font-semibold text-slate-500 dark:text-zinc-400">{{ $t("capability") }}</dt>
            <dd class="text-slate-800 dark:text-zinc-200">{{ item.capability }}</dd>
          </div>
          <div v-if="item.address">
            <dt class="mb-1 font-semibold text-slate-500 dark:text-zinc-400">{{ $t("tokenstats_nft_owner") }}</dt>
            <dd><BaseCopy :text="item.address" :url="`/address/${item.address}`" :copy="true" :short="true" /></dd>
          </div>
          <div>
            <dt class="mb-1 font-semibold text-slate-500 dark:text-zinc-400">Output</dt>
            <dd><BaseCopy :text="item.id" :url="`/tx/${item.id.split(':')[0]}`" :copy="true" :short="true" /></dd>
          </div>
        </dl>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRegistryStore } from "~/store";
import type { Capability, IdentitySnapshot } from "~/types";
import NFTImage from "./NFTImage.vue";

export interface ChildNftItem {
	id: string;
	category: string;
	capability: Capability;
	commitment: string;
	address?: string;
}

const props = defineProps<{
	items: ChildNftItem[];
	identitySnapshot?: IdentitySnapshot | null;
	loading: boolean;
	error?: string;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}>();
const registryStore = useRegistryStore();
const cards = computed(() =>
	props.items.map((item) => {
		const identity = props.identitySnapshot?.token?.nfts?.parse.types[item.commitment]
			|| props.identitySnapshot;
		const metadata = props.identitySnapshot !== undefined
			? { loading: false, token: identity ? { name: identity?.name, image: identity?.uris?.image, icon: identity?.uris?.icon } : undefined }
			: registryStore.getToken(item.category, item.capability, item.commitment);
		return { ...item, metadata, name: metadata.token?.name || "Unnamed NFT" };
	}),
);
const emit = defineEmits<{
	next: [];
	previous: [];
	retry: [];
}>();
</script>
