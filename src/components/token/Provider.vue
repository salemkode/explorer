<template>
  <section aria-labelledby="registry-source-title" class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs">
    <h3 id="registry-source-title" class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">BCMR registry source</h3>
    <p class="text-xs text-slate-500 dark:text-zinc-400 mb-3">Choose whose metadata to display. Auth-chain history is selected separately above.</p>
    <div class="space-y-1">
      <button v-for="provider in providers" :key="provider.url" type="button" class="w-full text-left p-2.5 rounded-xl border focus-visible:outline-2 focus-visible:outline-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed" :class="provider.url === select ? 'bg-emerald-500/10 border-emerald-500/20' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/60 border-transparent'" :aria-pressed="provider.url === select" :disabled="!provider.available" @click="$emit('select', provider.url)">
        <span class="block text-sm font-medium break-words">{{ provider.name }}</span>
        <span class="block text-xs text-slate-500 dark:text-zinc-400">{{ provider.detail }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { useAuthChainSelection } from "~/hooks/authChainSelection";
import { getRegistryIdentity } from "~/module/authchains";
import { useRegistryStore } from "~/store";

const props = defineProps<{
	category: string;
	select: string;
	authMetadata: ReturnType<typeof useAuthChainSelection>["metadata"]["value"];
}>();
defineEmits<{ select: [url: string] }>();
const registryStore = useRegistryStore();
const providers = computed(() => [
	{
		url: "auth_chain",
		name: "Selected auth-chain publication",
		available: true,
		detail: props.authMetadata.status === "loading" ? "Loading selected metadata…" : props.authMetadata.status === "ready" ? "Use the selected migration’s metadata" : "No usable metadata at this selection",
	},
	...registryStore.registryList.filter(({ url, enable }) => url !== "auth_chain" && enable).map(({ name, url }) => {
		const registry = registryStore.registryProviders.get(url);
		const available = Boolean(registry && getRegistryIdentity(registry, props.category));
		return { name, url, available, detail: available ? "Registry provider · publication hash not checked" : registryStore.loadingProviders ? "Loading registry…" : "No current metadata for this token" };
	}),
]);
</script>
