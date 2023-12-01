<template>
  <div class="transaction-list card">
    <h3 class="p-3 d-flex justify-content-between align-items-center">
      Block transaction
      <BasePagination
        :has-next-page="hasNextPage"
        :has-prev-page="hasPrevPage"
        @next="emit('update:offset', props.offset + props.limit)"
        @previous="emit('update:offset', props.offset - props.limit)"
      />
    </h3>
    <TransactionList v-if="transactions?.length" :transactions="transactions" />
    <div v-else class="text-center my-5 py-5">Not Found Transactions</div>
    <LoadingSpinner v-if="loading" class="m-auto my-2" />
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

const emit = defineEmits<{
  (event: "update:offset", offset: number): void;
}>();

const hasPrevPage = computed(() => props.offset > 0);
const hasNextPage = computed(() => {
  if (props.transactions) {
    return props.transactions.length === props.limit;
  }
  return false;
});
</script>
