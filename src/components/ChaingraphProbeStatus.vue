<template>
  <span class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px]">
    <template v-if="!probe || probe.status === 'checking'">
      <span class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600 animate-pulse" aria-hidden="true" />
      <span class="text-slate-400 dark:text-zinc-500">Checking…</span>
    </template>
    <template v-else-if="probe.status === 'offline'">
      <span class="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
      <span class="text-red-600 dark:text-red-400">Offline · {{ probe.message }}</span>
    </template>
    <template v-else>
      <span
        class="w-1.5 h-1.5 rounded-full"
        :class="probe.networks.includes(network) ? 'bg-emerald-500' : 'bg-amber-500'"
        aria-hidden="true"
      />
      <span class="text-slate-600 dark:text-zinc-300">
        Online · {{ probe.latencyMs.toLocaleString("en-US") }} ms ·
        {{ probe.networks.length ? probe.networks.join(", ") : "no mainnet or chipnet node" }}
      </span>
      <span v-if="probe.networks.length && !probe.networks.includes(network)" class="text-amber-600 dark:text-amber-400">
        · no {{ network }} node
      </span>
    </template>
  </span>
</template>

<script setup lang="ts">
import type { ExplorerNetwork, ProbeState } from "~/module/chaingraphServer";

defineProps<{ probe?: ProbeState; network: ExplorerNetwork }>();
</script>
