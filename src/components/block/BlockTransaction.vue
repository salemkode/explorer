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
    <LoadingSpinner
      v-if="loading && transactions.length === 0"
      class="m-auto"
    />
    <div v-else-if="transactions.length === 0" class="text-center my-5 py-5">
      Not Found Transactions
    </div>
    <TransactionList v-else :transactions="transactions" />
  </div>
</template>

<script setup lang="ts">
import { type transactions } from "~/components/Transaction/TransactionList.vue";
const props = defineProps<{
  transactions?: transactions;
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
