<template>
  <Teleport to="body">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      >
  <div
    class="absolute inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-xs transition-opacity duration-200 ease-out starting:opacity-0"
    aria-hidden="true"
    @click="emit('close')"
  />
  <section
    ref="panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="auth-chains-title"
    tabindex="-1"
    class="relative w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xl min-w-0 focus:outline-none transition-transform duration-200 ease-out starting:translate-y-4"
  >
    <header class="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
      <div class="min-w-0">
        <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 id="auth-chains-title" class="text-lg font-semibold text-slate-900 dark:text-white">Auth chains</h2>
          <span class="text-xs text-slate-500 dark:text-zinc-400">{{ chains.length }} available</span>
        </div>
        <p class="mt-1 text-sm text-slate-600 dark:text-zinc-400">Explore each possible authhead and its migration history. Selecting a migration shows the metadata published at that point.</p>
      </div>
      <button
        type="button"
        class="shrink-0 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500"
        aria-label="Close auth chains"
        @click="emit('close')"
      >
        <svg aria-hidden="true" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>
    <div class="flex-1 overflow-y-auto px-5 sm:px-6 py-5 min-w-0">
    <div v-if="loading" role="status" aria-busy="true" class="space-y-4">
      <span class="sr-only">Loading auth chains</span>
      <Skeleton class="h-4 w-64 max-w-full" />
      <Skeleton class="h-11 w-full rounded-xl" />
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <div class="space-y-3">
          <Skeleton class="h-3 w-40" />
          <Skeleton class="h-12 w-full rounded-lg" />
          <Skeleton class="h-12 w-full rounded-lg" />
        </div>
        <div class="space-y-3">
          <Skeleton class="h-4 w-36" />
          <Skeleton class="h-3 w-full" />
          <Skeleton class="h-3 w-3/4" />
        </div>
      </div>
    </div>
    <div v-else-if="error" role="alert" class="text-sm text-amber-700 dark:text-amber-400">
      <p>Auth chains could not be loaded. Check your connection and try again.</p>
      <button type="button" class="mt-2 underline rounded focus-visible:outline-2 focus-visible:outline-emerald-500" @click="$emit('retry')">Retry auth chains</button>
    </div>
    <p v-else-if="!chains.length" class="text-sm text-slate-600 dark:text-zinc-400">No auth chains were returned for this token. A registry provider may still have metadata.</p>
    <template v-else>
      <label for="auth-chain" class="block text-sm font-medium mb-2">Auth chain · identified by authhead transaction</label>
      <select id="auth-chain" v-model="chainModel" class="w-full min-w-0 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-3 text-sm focus-visible:outline-2 focus-visible:outline-emerald-500">
        <option v-if="selection.missing && !selection.chain" value="" disabled>Requested chain is unavailable</option>
        <option v-for="chain in chains" :key="chain.id" :value="chain.id">{{ chain.id }} · {{ chain.unspent === true ? 'unspent' : chain.unspent === false ? 'spent' : 'spend status unavailable' }}</option>
      </select>
      <div v-if="selection.missing" role="alert" class="mt-3 text-sm text-amber-700 dark:text-amber-400">
        This link refers to a chain or migration that is unavailable.
        <button type="button" class="underline rounded focus-visible:outline-2 focus-visible:outline-emerald-500" @click="$emit('reset')">Show the default chain</button>
      </div>
      <div v-if="selection.chain" class="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">Migration timeline · newest first</p>
          <p class="text-xs text-slate-500 dark:text-zinc-400 mb-3">Chain length: {{ selection.chain.length ?? 'unavailable' }} · {{ selection.chain.revisions.length }} migrations returned</p>
          <ol v-if="selection.chain.revisions.length" aria-label="Auth chain migrations" class="max-h-80 overflow-y-auto space-y-2 p-1">
            <li v-for="(revision, index) in selection.chain.revisions" :key="revision.id" class="border-l-2 pl-3 py-1" :class="selection.revision?.id === revision.id ? 'border-emerald-500' : 'border-slate-200 dark:border-zinc-700'">
              <button type="button" :aria-pressed="selection.revision?.id === revision.id" class="text-left w-full rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-emerald-500" :class="selection.revision?.id === revision.id ? 'bg-emerald-500/10' : ''" @click="$emit('revision', revision.id)">
                <span class="block text-sm font-medium">Migration {{ revision.index ?? 'index unavailable' }}{{ index === 0 ? ' · Latest' : '' }}{{ selection.revision?.id === revision.id ? ' · Selected' : '' }}</span>
                <span class="block text-xs text-slate-500 dark:text-zinc-400">{{ publicationLabels[revision.publication.status] }} · {{ formatTimestamp(revision.timestamp) }}</span>
              </button>
              <NuxtLink :to="`/tx/${revision.id}`" class="block text-xs font-mono break-all text-emerald-700 dark:text-emerald-400 underline rounded p-2 focus-visible:outline-2 focus-visible:outline-emerald-500" :aria-label="`View migration transaction ${revision.id}`">{{ revision.id }}</NuxtLink>
            </li>
          </ol>
          <p v-else class="text-sm text-slate-500 dark:text-zinc-400">No migrations were returned for this chain.</p>
        </div>
        <div class="min-w-0 text-sm space-y-3">
          <h3 class="font-semibold">Selected publication</h3>
          <p class="text-xs break-all">Authhead: <NuxtLink :to="`/tx/${selection.chain.id}`" class="text-emerald-700 dark:text-emerald-400 underline rounded focus-visible:outline-2 focus-visible:outline-emerald-500">{{ selection.chain.id }}</NuxtLink></p>
          <p v-if="selection.publicationRevision" class="text-xs break-all">Publication transaction: <NuxtLink :to="`/tx/${selection.publicationRevision.id}`" class="text-emerald-700 dark:text-emerald-400 underline rounded focus-visible:outline-2 focus-visible:outline-emerald-500">{{ selection.publicationRevision.id }}</NuxtLink></p>
          <template v-if="publication?.status === 'published'">
            <p class="break-all"><span class="block text-xs text-slate-500 dark:text-zinc-400">Registry URL</span>{{ publication.url }}</p>
            <p class="break-all font-mono text-xs"><span class="block font-sans text-slate-500 dark:text-zinc-400">{{ publication.checkHash ? 'Published SHA-256' : 'Published CID (hex)' }}</span>{{ publication.contentHash }}</p>
          </template>
          <div role="status" aria-live="polite" class="rounded-xl bg-slate-50 dark:bg-zinc-950 p-3 space-y-2">
            <div v-if="metadata.status === 'loading'" class="space-y-2">
              <span class="sr-only">Loading selected metadata</span>
              <Skeleton class="h-3.5 w-2/3" />
              <Skeleton class="h-3 w-1/2" />
            </div>
            <template v-else-if="metadata.status === 'unavailable'">
              <p>{{ metadata.message }}</p>
              <p class="text-xs text-slate-500 dark:text-zinc-400">Choose another migration or registry source, or reload to try again.</p>
            </template>
            <p v-else-if="metadata.status === 'ready'">Metadata loaded for {{ metadata.identity.name }}.</p>
            <p v-if="'hashStatus' in metadata && metadata.hashStatus" class="font-medium">{{ hashLabels[metadata.hashStatus] }}</p>
            <p v-if="metadata.status === 'unavailable' && !('hashStatus' in metadata)">Hash verification unavailable.</p>
            <p v-if="metadata.status === 'ready'" class="text-xs">Registry revision: {{ metadata.registry.latestRevision }}</p>
            <p v-if="'actualHash' in metadata" class="text-xs break-all font-mono">Downloaded SHA-256: {{ metadata.actualHash }}</p>
          </div>
          <p class="text-xs text-slate-500 dark:text-zinc-400">A matching hash proves content integrity, not the issuer’s identity or trustworthiness. CID integrity is not checked here.</p>
        </div>
      </div>
    </template>
    </div>
  </section>
      </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { useAuthChainSelection } from "~/hooks/authChainSelection";
import type { listAuthChains, selectAuthChain } from "~/module/authchains";

const props = defineProps<{
	chains: ReturnType<typeof listAuthChains>;
	selection: ReturnType<typeof selectAuthChain>;
	metadata: ReturnType<typeof useAuthChainSelection>["metadata"]["value"];
	loading: boolean;
	error: boolean;
	open: boolean;
}>();
const emit = defineEmits<{
	chain: [id: string];
	revision: [id: string];
	reset: [];
	retry: [];
	close: [];
}>();
const panel = ref<HTMLElement>();
let returnFocus: HTMLElement | null = null;
const focusable =
	'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
function onKeydown(event: KeyboardEvent) {
	if (!props.open || !panel.value) return;
	if (event.key === "Escape") {
		emit("close");
		return;
	}
	if (event.key !== "Tab") return;
	// Keep keyboard focus inside the dialog; the page behind it is obscured.
	const items = [...panel.value.querySelectorAll<HTMLElement>(focusable)];
	const first = items[0];
	const last = items.at(-1);
	if (!first || !last) {
		event.preventDefault();
		panel.value.focus();
		return;
	}
	const active = document.activeElement;
	const outside = !panel.value.contains(active);
	if (event.shiftKey && (active === first || active === panel.value || outside)) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && (active === last || outside)) {
		event.preventDefault();
		first.focus();
	}
}
watch(
	() => props.open,
	async (open) => {
		if (!import.meta.client) return;
		document.body.style.overflow = open ? "hidden" : "";
		if (open) {
			returnFocus = document.activeElement as HTMLElement | null;
			await nextTick();
			panel.value?.focus();
		} else {
			// Hand focus back to whatever opened the dialog (usually the Auth chain button).
			returnFocus?.focus();
			returnFocus = null;
		}
	},
	{ immediate: true },
);
onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => {
	document.removeEventListener("keydown", onKeydown);
	document.body.style.overflow = "";
});
const chainModel = computed({
	get: () => props.selection.chain?.id || "",
	set: (id: string) => emit("chain", id),
});
const publication = computed(() => props.selection.publicationRevision?.publication);
const publicationLabels = { published: "BCMR publication", invalid: "Malformed BCMR publication", none: "No new publication" };
const hashLabels = { match: "SHA-256 matches publication", mismatch: "SHA-256 does not match publication", "not-checked": "CID integrity not checked" };
function formatTimestamp(timestamp: string | number | undefined) {
	return timestamp === undefined ? "Block time unavailable" : `${new Date(Number(timestamp) * 1000).toISOString().replace("T", " ").replace(".000Z", " UTC")}`;
}
</script>
