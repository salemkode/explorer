<template>
  <section aria-labelledby="cashtoken-activity-title" :aria-busy="view.type === 'loading'" class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
    <div class="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h2 id="cashtoken-activity-title" class="text-base font-bold text-slate-900 dark:text-white">CashToken activity</h2>
        <p class="mt-1 text-xs text-slate-500 dark:text-zinc-400">Latest {{ cashTokenActivityLimits.blocks }} indexed, accepted blocks · {{ stateStore.network }}</p>
      </div>
      <button type="button" :disabled="loading" class="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:opacity-50 disabled:cursor-wait" @click="refetch()">Refresh</button>
    </div>

    <div v-if="view.type === 'loading'" role="status" class="px-5 py-10 text-sm text-slate-500 dark:text-zinc-400">Loading recent CashToken activity…</div>
    <div v-else-if="view.type === 'error'" role="alert" class="px-5 py-10 text-sm text-slate-600 dark:text-zinc-400">Unable to load CashToken activity. Use Refresh to try again.</div>
    <div v-else-if="view.type === 'unavailable'" role="status" class="px-5 py-10 text-sm text-slate-600 dark:text-zinc-400">The data provider returned no accepted blocks for {{ stateStore.network }}. Use Refresh to try again.</div>
    <div v-else>
      <div class="px-5 py-4 space-y-3">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
          <span>Source: configured Chaingraph provider · Blocks</span>
          <NuxtLink v-for="block in view.summary.blocks" :key="block.hash" :to="`/block/${block.hash}`" class="font-mono text-emerald-700 dark:text-emerald-400 rounded-sm underline decoration-emerald-500/30 underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500">#{{ block.height }}</NuxtLink>
        </div>
        <p class="text-xs text-slate-500 dark:text-zinc-400">Newest block time: {{ new Date(Number(view.summary.blocks[0]?.timestamp) * 1000).toUTCString() }}. Refreshes every minute.</p>
        <p v-if="view.summary.truncated" role="status" class="rounded-xl p-3 bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">Activity limit reached. Counts and units cover the sampled outputs only; more activity exists in these blocks.</p>
        <dl class="grid grid-cols-3 gap-3">
          <div><dt class="text-xs text-slate-500 dark:text-zinc-400">Transactions observed</dt><dd class="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">{{ view.summary.transactionCount }}</dd></div>
          <div><dt class="text-xs text-slate-500 dark:text-zinc-400">Categories observed</dt><dd class="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">{{ view.summary.categories.length }}</dd></div>
          <div><dt class="text-xs text-slate-500 dark:text-zinc-400">NFT outputs</dt><dd class="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">{{ view.summary.nftOutputs }}</dd></div>
        </dl>
      </div>
      <p v-if="view.summary.categories.length === 0" role="status" class="px-5 pb-5 text-sm text-slate-600 dark:text-zinc-400">No CashToken outputs were found in these {{ view.summary.blocks.length }} blocks. Refresh later or open a block to explore its transactions.</p>
      <template v-else>
        <ul class="divide-y divide-slate-100 dark:divide-zinc-800/60 border-t border-slate-100 dark:border-zinc-800/80">
          <li v-for="row in categoryPage.rows" :key="row.category" class="px-5 py-4 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-5">
            <div class="min-w-0 md:col-span-4">
              <NuxtLink :to="`/token/${row.category}`" class="block rounded-sm text-sm font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500">
                <span class="block break-words">{{ cashTokenActivityName(row.category, registryStore.getTokenIdentity(row.category).identity) }}</span>
                <span class="block font-mono text-xs font-normal text-slate-500 dark:text-zinc-400 break-all mt-1">{{ row.category }}</span>
              </NuxtLink>
            </div>
            <dl class="grid grid-cols-3 gap-3 md:col-span-6 text-xs">
              <div><dt class="text-slate-500 dark:text-zinc-400">Transactions</dt><dd class="mt-1 font-mono text-slate-900 dark:text-white">{{ row.transactionCount }}</dd></div>
              <div class="min-w-0"><dt class="text-slate-500 dark:text-zinc-400">FT in outputs</dt><dd class="mt-1 font-mono break-all text-slate-900 dark:text-white" :title="`${row.fungibleUnits} base units`">{{ fungibleText(row.category, row.fungibleUnits) }}</dd></div>
              <div><dt class="text-slate-500 dark:text-zinc-400">NFT outputs</dt><dd class="mt-1 font-mono text-slate-900 dark:text-white">{{ row.nftOutputs }}</dd><dd v-if="row.mintingOutputs" class="mt-1 text-slate-500 dark:text-zinc-400">{{ row.mintingOutputs }} with minting capability</dd></div>
            </dl>
            <div class="md:col-span-2 md:text-right">
              <NuxtLink :to="`/tx/${row.latestTxid}`" :aria-label="`Latest observed transaction for category ${row.category}`" class="inline-block rounded-sm text-xs text-emerald-700 dark:text-emerald-400 underline decoration-emerald-500/30 underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500">Latest observed tx</NuxtLink>
            </div>
          </li>
        </ul>
        <nav v-if="categoryPage.pages > 1" aria-label="CashToken category pages" class="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-zinc-800/80 text-xs text-slate-600 dark:text-zinc-400">
          <button type="button" :disabled="categoryPage.page === 1" class="rounded-lg border border-slate-200 dark:border-zinc-700 px-3 py-2 hover:bg-slate-50 dark:hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:opacity-40" @click="page = categoryPage.page - 1">Previous</button>
          <span role="status">Page {{ categoryPage.page }} of {{ categoryPage.pages }}</span>
          <button type="button" :disabled="categoryPage.page === categoryPage.pages" class="rounded-lg border border-slate-200 dark:border-zinc-700 px-3 py-2 hover:bg-slate-50 dark:hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:opacity-40" @click="page = categoryPage.page + 1">Next</button>
        </nav>
      </template>
      <div class="px-5 py-4 border-t border-slate-100 dark:border-zinc-800/80 space-y-2 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
        <p>Window: up to {{ cashTokenActivityLimits.transactionsPerBlock }} transactions with token outputs per block, newest transaction index first; up to {{ cashTokenActivityLimits.outputsPerTransaction }} token outputs per transaction, output index ascending. Categories appear in first-observed order.</p>
        <p>FT amounts are exact; each token's decimals and symbol are applied once its metadata loads, and amounts without metadata are shown in base units. NFT outputs include minting authorities. Outputs can include change, genesis and repeated movement; these figures are not transfer volume, minted supply or global rankings. Burn-only transactions without token outputs are excluded.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAuthChains } from "~/hooks/authchains";
import {
	cashTokenActivityLimits,
	cashTokenActivityName,
	cashTokenActivityVariables,
	cashTokenCategoryPage,
	summarizeCashTokenActivity,
} from "~/module/cashTokenActivity";
import { GetCashTokenActivity } from "~/module/cashTokenActivityQuery";
import { formatTokenAmount } from "~/module/tokenAmount";
import { useRegistryStore, useStateStore } from "~/store";

const stateStore = useStateStore();
const registryStore = useRegistryStore();
const page = ref(1);
const { result, loading, error, refetch } = useQuery(
	GetCashTokenActivity,
	() => cashTokenActivityVariables(stateStore.network),
	{
		fetchPolicy: "network-only",
		pollInterval: 60_000,
		notifyOnNetworkStatusChange: true,
		keepPreviousResult: false,
	},
);
const view = computed(() => {
	if (loading.value) return { type: "loading" } as const;
	if (error.value || !result.value) return { type: "error" } as const;
	if (result.value.block.length === 0) return { type: "unavailable" } as const;
	return { type: "loaded", summary: summarizeCashTokenActivity(result.value.block) } as const;
});
const categoryPage = computed(() => cashTokenCategoryPage(view.value.type === "loaded" ? view.value.summary.categories : [], page.value));
watch([() => stateStore.network, result], () => { page.value = 1; });
// Names and decimals of most tokens come from their on-chain (authchain) BCMR.
useAuthChains(
	computed(() => categoryPage.value.rows.map(({ category }) => `\\x${category}` as const)),
);
/** Exact amount in token units once metadata is known; base units until then. */
function fungibleText(category: string, units: string) {
	if (units === "0") return "0";
	const token = registryStore.getToken(category);
	if (token.loading) return "…";
	if (!token.token) return `${formatTokenAmount(units)} base units`;
	const symbol = token.token.symbol ? ` ${token.token.symbol}` : "";
	return `${formatTokenAmount(units, token.token.decimals)}${symbol}`;
}
</script>
