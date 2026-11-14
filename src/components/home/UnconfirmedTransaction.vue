<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <i class="uicon-duplicate text-emerald-600 dark:text-emerald-400 text-base" />
        <h3 class="text-base font-bold text-slate-900 dark:text-white">
          Latest Transactions
        </h3>
      </div>
      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
        <span class="w-1.5 h-1.5 rounded-full bg-current" />
        {{ status.label }}
      </span>
    </div>

    <Transition name="fade" mode="out-in">
      <div
        v-if="status.type === 'connecting'"
        key="loading"
        class="divide-y divide-slate-100 dark:divide-zinc-800/60"
      >
        <div
          v-for="i in 9"
          :key="i"
          class="flex items-center justify-between gap-4 px-5 py-3.5 motion-safe:animate-pulse"
        >
          <div class="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-md w-32" />
          <div class="h-3 bg-slate-100 dark:bg-zinc-800/60 rounded-md w-48 hidden md:block" />
          <div class="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-md w-20 ml-auto" />
        </div>
      </div>
      <div
        v-else-if="!hasNode || (transactions.length === 0 && status.type !== 'live')"
        key="unavailable"
        class="py-12 px-5 text-center text-sm text-slate-500 dark:text-zinc-400"
      >
        {{ status.message }}
      </div>
      <div
        v-else-if="transactions.length === 0"
        key="empty"
        class="py-12 text-center text-sm text-slate-400 dark:text-zinc-500"
      >
        No unconfirmed transactions reported by this node.
      </div>
      <TransactionList
        v-else
        key="list"
        :transactions="transactions"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Transactions } from "~/components/Transaction/TransactionList.vue";
import type { useNetworkStatus } from "~/composables/useNetworkStatus";

defineProps<{
	transactions: Transactions;
	status: ReturnType<typeof useNetworkStatus>["status"]["value"];
	hasNode: boolean;
}>();
</script>
