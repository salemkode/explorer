<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs transition-colors">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
      BCMR Registry Source
    </h3>
    <div class="space-y-1">
      <div
        v-for="{ name, registry, loading, isValidHash } in providers"
        :key="name"
        class="w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer select-none"
        :class="
          name === props.select
            ? 'bg-emerald-500/10 border border-emerald-500/20'
            : 'hover:bg-slate-50 dark:hover:bg-zinc-800/60 border border-transparent'
        "
        @click="selectRegistry(name, registry)"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <LoadingSpinner v-if="loading" small />
          <PopOver
            v-else-if="!registry || !isValidHash"
            :msg="!isValidHash ? 'metadata hash matches' : 'not found in registry'"
          >
            <i class="uicon-unverified text-amber-500 text-base" />
          </PopOver>
          <i v-else class="uicon-verified text-emerald-500 text-base" />
          <span class="text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200 truncate" v-text="name" />
        </div>

        <div
          class="w-2.5 h-2.5 rounded-full transition-all shrink-0 ml-2"
          :class="
            name === props.select
              ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
              : 'border border-slate-300 dark:border-zinc-600'
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegistryStore } from "~/store";
import type { Registry } from "~/types";
const registryStore = useRegistryStore();

const props = defineProps<{
	category: string;
	select: string;
}>();
const emit = defineEmits<(e: "select", url: string) => void>();

const getRegistryUrl = (name: string) =>
	registryStore.registryList.find((item) => item.name === name)?.url;

const getOrder = (name: string, url?: string) => {
	return registryStore.registryList.findIndex(
		(registry) => registry.name === name || registry.url === url,
	);
};

const hasCategory = (registry: Registry, category: string) => {
	if (!registry) {
		return false;
	}

	const identities = registry.identities;
	const identity = identities?.[category];
	if (identity) {
		return !!Object.values(identities[category])?.find(
			(identity) => identity.token?.category,
		);
	}
};

type ProviderItem = {
	name: string;
	registry?: Registry;
	isValidHash?: boolean;
	loading?: boolean;
	url?: string;
};
const providers = computed(() => {
	const authChainProviders = registryStore.authchains.get(props.category);
	const items: ProviderItem[] = [
		{
			name: "AuthChain",
			registry:
				typeof authChainProviders === "object" ? authChainProviders : undefined,
			isValidHash: registryStore.authchainsVerified.get(props.category),
			loading: authChainProviders === true,
		},
	];

	registryStore.registryProviders.forEach((registryProvider, url) => {
		if (typeof registryProvider.registryIdentity === "string") {
			return;
		}

		items.push({
			name: registryProvider.registryIdentity.name,
			registry: hasCategory(registryProvider, props.category)
				? registryProvider
				: undefined,
			isValidHash: true,
			loading: registryStore.loadingProviders,
			url,
		});
	});

	return items.sort(
		({ name: name1, url: url1 }, { name: name2, url: url2 }) =>
			getOrder(name1, url1) - getOrder(name2, url2),
	);
});

const selectRegistry = (name: string, registry?: Registry) => {
	if (typeof registry === "object" && hasCategory(registry, props.category)) {
		emit("select", getRegistryUrl(name) || "");
	}
};
</script>
