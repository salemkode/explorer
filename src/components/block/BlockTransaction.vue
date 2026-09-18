<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
    <div class="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
      <h3 class="text-base font-bold text-slate-900 dark:text-white">
        Block Transactions
      </h3>
      <BasePagination
        :has-next-page="hasNextPage"
        :has-prev-page="hasPrevPage"
        @next="emit('update:offset', props.offset + props.limit)"
        @previous="emit('update:offset', props.offset - props.limit)"
      />
    </div>

    <TransactionList v-if="transactions?.length" :transactions="transactions" />
    <div v-else class="py-12 text-center text-sm text-slate-400 dark:text-zinc-500">
      No transactions found in this block
    </div>
    <LoadingSpinner v-if="loading" class="py-6" />
  </div>
</template>

<script setup lang="ts">
import type { Transactions } from "~/components/Transaction/TransactionList.vue";
const props = defineProps<{
	transactions?: Transactions;
	loading: boolean;
	limit: number;
	offset: number;
}>();

const emit = defineEmits<(event: "update:offset", offset: number) => void>();

const hasPrevPage = computed(() => props.offset > 0);
const hasNextPage = computed(() => {
	if (props.transactions) {
		return props.transactions.length === props.limit;
	}
	return false;
});
</script>
