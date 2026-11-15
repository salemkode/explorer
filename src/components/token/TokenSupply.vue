<template>
  <section aria-labelledby="token-supply-heading" class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs">
    <div class="flex items-center justify-between gap-3 mb-4">
      <h2 id="token-supply-heading" class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Fungible supply</h2>
      <button type="button" :disabled="calculation.status === 'loading'" class="text-xs font-semibold text-emerald-700 dark:text-emerald-400 rounded-md px-2 py-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:opacity-50 disabled:cursor-wait" @click="recalculate">Recalculate</button>
    </div>
    <p role="status" class="text-xs text-slate-500 dark:text-zinc-400 mb-4">
      <template v-if="calculation.status === 'loading'">Calculating confirmed supply… Mempool transactions are excluded.</template>
      <template v-else-if="calculation.status === 'unknown'">{{ calculation.reason }}</template>
      <template v-else>Confirmed through block {{ calculation.height }} · {{ network }} · {{ calculation.supply.transactions }} transactions checked.</template>
    </p>
    <dl class="space-y-4">
      <div v-for="metric in metrics" :key="metric.label">
        <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{{ metric.label }}</dt>
        <dd class="mt-1 text-sm font-medium tabular-nums text-slate-800 dark:text-zinc-200 break-all">{{ metric.value }}</dd>
      </div>
    </dl>
    <p v-if="calculation.status === 'ready'" class="mt-4 text-xs text-amber-700 dark:text-amber-400">Partial burn coverage. Other ways of making tokens unspendable cannot be proven here.</p>
    <details class="mt-4 text-xs text-slate-600 dark:text-zinc-400">
      <summary class="cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500">How supply is calculated</summary>
      <div class="mt-3 space-y-2 leading-relaxed">
        <p v-if="calculation.status === 'ready'">Detected burns: {{ formatTokenSupply(calculation.supply.implicitBurn, decimals) }} missing from transaction outputs; {{ formatTokenSupply(calculation.supply.explicitBurn, decimals) }} in provably unspendable outputs. Source: {{ calculation.node }}.</p>
        <p>Genesis supply is the amount issued for this category. Burned supply counts confirmed input amounts missing from outputs, plus tokens sent to scripts beginning with OP_RETURN or OP_FALSE OP_RETURN. These are detected burns, not a total of every possible burn.</p>
        <p>Supply excluding detected burns = genesis supply − detected burns. Circulating supply subtracts the confirmed, unspent Selected BCMR authhead reserve from that remaining supply once. Both remaining figures are upper bounds: lost keys, burn addresses and other unspendable contracts are not detectable.</p>
        <p>The Selected BCMR authhead reserve is output 0 of the current authhead, not all tokens owned by the issuer. If that output cannot be verified at this block, reserve and circulation are unknown. A reserve already counted as burned is not subtracted again.</p>
        <p>Amounts use registry decimals ({{ decimals }}). History is read from one node on the selected network, with no mempool changes. Missing, inconsistent or truncated history makes totals unknown. Recalculate to include newer blocks.</p>
      </div>
    </details>
  </section>
</template>

<script setup lang="ts">
import { useTokenSupply } from "~/hooks/tokenSupply";
import { formatTokenSupply } from "~/module/tokenSupply";
import { useStateStore } from "~/store";

const props = defineProps<{ category: string; decimals: number; authhead?: string }>();
const { network } = storeToRefs(useStateStore());
const { calculation, circulation, recalculate } = useTokenSupply(toRef(props, "category"), () => props.authhead);
const metrics = computed(() => {
	const state = calculation.value;
	if (state.status !== "ready") {
		const value = state.status === "loading" ? "Calculating…" : "Unknown";
		return ["Genesis supply", "Burned supply", "Supply excluding detected burns", "Selected BCMR authhead reserve", "Circulating supply"].map((label) => ({ label, value }));
	}
	const format = (amount: bigint) => formatTokenSupply(amount, props.decimals);
	return [
		{ label: "Genesis supply", value: format(state.supply.issued) },
		{ label: "Burned supply", value: `${format(state.supply.burned)} detected` },
		{ label: "Supply excluding detected burns", value: `At most ${format(state.supply.current)}` },
		{ label: "Selected BCMR authhead reserve", value: state.reserve === null ? "Unknown" : format(state.reserve) },
		{ label: "Circulating supply", value: circulation.value === null ? "Unknown" : `At most ${format(circulation.value)}` },
	];
});
</script>
