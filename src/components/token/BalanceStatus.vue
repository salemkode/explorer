<template>
  <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400">
    <p role="status" aria-live="polite">
      <template v-if="state.status === 'loading'">Loading complete confirmed balances…</template>
      <template v-else-if="state.status === 'error'">{{ state.message }}</template>
      <template v-else-if="state.status === 'ready'">Confirmed at block {{ state.height }}. Pending transactions are not included.</template>
      <template v-else>Balances are unavailable.</template>
    </p>
    <button
      type="button"
      :disabled="state.status === 'loading'"
      class="shrink-0 rounded-lg px-3 py-2 font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-wait"
      @click="$emit('refresh')"
    >Refresh balances</button>
  </div>
</template>

<script setup lang="ts">
import type { useTokenBalanceSnapshot } from "~/hooks/tokenBalances";

defineProps<{
	state: ReturnType<typeof useTokenBalanceSnapshot>["state"]["value"];
}>();
defineEmits<{ refresh: [] }>();
</script>
