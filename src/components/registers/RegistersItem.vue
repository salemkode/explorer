<template>
  <div
    v-if="typeof registry.registryIdentity === 'object'"
    class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs hover:border-emerald-500/40 transition-all cursor-pointer"
    @click="open = !open"
  >
    <div class="flex flex-col sm:flex-row items-start gap-4">
      <div class="w-16 h-16 rounded-xl bg-slate-50 dark:bg-zinc-800 p-2 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-center shrink-0">
        <Image
          :href="registry.registryIdentity.uris?.icon || ''"
          :size="56"
          :failure-href="EmptyImage"
          :token-category="registry.registryIdentity.name"
          :icon="registry.registryIdentity.uris?.icon || ''"
          class="max-w-full max-h-full object-contain"
        />
      </div>

      <div v-if="typeof registry.registryIdentity !== 'string'" class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2 mb-1">
          <h4 class="text-base font-bold text-slate-900 dark:text-white truncate" v-text="registry.registryIdentity.name" />
          <span
            class="text-[11px] font-mono text-slate-400 dark:text-zinc-500 shrink-0"
            v-text="formatTimeAgo(registry.latestRevision)"
          />
        </div>
        <p class="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-2" v-text="registry.registryIdentity.description || ''" />

        <div v-if="registry.registryIdentity.tags" class="flex flex-wrap gap-1.5">
          <span
            v-for="tag in registry.registryIdentity.tags"
            :key="tag"
            class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
            v-text="tag"
          />
        </div>
      </div>
    </div>

    <SliderUpDown :active="open" @click.stop>
      <div class="border-t border-slate-100 dark:border-zinc-800/80 pt-4 mt-4">
        <TableView
          title="Register tokens"
          :rows="transactions"
          :columns="['token', 'category', 'symbol']"
          :has-prev-page="!!pagination"
          :has-next-page="pagination < maxPagination"
          header-less
          class="mt-2"
          @next="maxPagination++"
          @previous="maxPagination--"
        />
        <div class="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/60">
          <DropDown class="sm:hidden" :title="$t('uris')" :items="uris" />
          <a
            v-for="url in uris"
            :key="url.name"
            :href="url.href"
            target="_blank"
            rel="noopener noreferrer"
            class="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-colors"
          >
            <span>{{ $t(url.name) }}</span>
            <span class="text-[10px] opacity-60">↗</span>
          </a>
        </div>
      </div>
    </SliderUpDown>
  </div>
</template>

<script setup lang="ts">
import EmptyImage from "~/assets/images/emptyImage.svg";
import { formatTimeAgo } from "~/module/utils";
import { useRegistryStore } from "~/store";
import type { Registry, tableColumn } from "~/types";

const open = ref(false);

const props = defineProps<{
	url: string;
	registry: Registry;
}>();

const registryStore = useRegistryStore();
const limit = 8;
const pagination = ref(0);
const maxPagination = ref(
	Object.keys(props.registry.identities || {}).length / limit,
);
const transactions = computed<tableColumn[][]>(() => {
	const identities = Object.keys(props.registry.identities || {});

	return identities
		.map((identity) => {
			const metadata = registryStore.getTokenFromRegister(
				props.registry,
				identity,
			);
			if (!metadata) return;
			const category = metadata.token?.category || "N/A";
			return [
				{
					text: metadata.name || "N/A",
					token: {
						category,
					},
					url: `/token/${category}`,
				},
				{
					text: category,
					short: true,
					copy: true,
					url: `/token/${category}`,
				},
				{
					text: metadata.token?.symbol || "N/A",
				},
			];
		})
		.filter(Boolean);
});

const uris = computed(() => {
	const registryIdentity = props.registry.registryIdentity;

	if (typeof registryIdentity !== "object") return [];
	return [
		{
			name: "website",
			href: registryIdentity?.uris?.web || "",
		},
		{
			name: "blog",
			href: registryIdentity?.uris?.blog || "",
		},
		{
			name: "chat",
			href: registryIdentity?.uris?.chat || "",
		},
		{
			name: "forum",
			href: registryIdentity?.uris?.forum || "",
		},
		{
			name: "raw",
			href: props.url,
		},
	].filter((url) => Boolean(url.href));
});
</script>
