<script setup lang="ts">
const config = useRuntimeConfig();
const indexerHost = new URL(config.public.chaingraphHttp).hostname;
const hostedByPat = indexerHost === "gql.chaingraph.pat.mn";
</script>

<template>
  <div class="space-y-2 text-xs text-slate-500 dark:text-zinc-400">
    <p class="font-semibold text-slate-700 dark:text-zinc-200">Blockchain indexer: Chaingraph</p>
    <p class="font-mono break-all">{{ indexerHost }}</p>
    <p v-if="hostedByPat" class="leading-relaxed">
      Hosted by <a href="https://github.com/mainnet-pat" target="_blank" rel="noopener noreferrer" class="text-emerald-600 dark:text-emerald-400 underline">Pat</a>, a mainnet.js developer.
      Thank you, Pat, for providing the infrastructure behind our blockchain and CashTokens queries.
    </p>
    <p v-else class="leading-relaxed">This deployment uses a custom Chaingraph endpoint.</p>
    <NuxtLink to="/sponsor" class="inline-block text-emerald-600 dark:text-emerald-400 underline">Support the explorer and its infrastructure</NuxtLink>
  </div>
</template>
