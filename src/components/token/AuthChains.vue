<template>
  <section aria-labelledby="auth-chains-title" class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs mb-6 min-w-0">
    <div class="flex flex-wrap items-baseline justify-between gap-2 mb-2">
      <h2 id="auth-chains-title" class="text-lg font-semibold text-slate-900 dark:text-white">Auth chains</h2>
      <span class="text-xs text-slate-500 dark:text-zinc-400">{{ chains.length }} available</span>
    </div>
    <p class="text-sm text-slate-600 dark:text-zinc-400 mb-5">Explore each possible authhead and its migration history. Selecting a migration shows the metadata published at that point.</p>
    <p v-if="loading" role="status">Loading auth chains…</p>
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
            <p v-if="metadata.status === 'loading'">Loading selected metadata…</p>
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
  </section>
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
}>();
const emit = defineEmits<{
	chain: [id: string];
	revision: [id: string];
	reset: [];
	retry: [];
}>();
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
