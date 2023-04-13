<template>
  <TableView
    title="Address Transactions"
    :rows="transactions"
    :columns="['txid', 'block_height']"
    :has-prev-page="!!offset"
    :has-next-page="!!hasNextPage"
    :loading="false"
    @next="offset += 8"
    @previous="offset -= 8"
  />
</template>

<script setup lang="ts">
import type { tableColumn } from "~/types/index.js";
import type { history } from "~/module/electrum";

const limit = ref(9);
const offset = ref(0);
const props = defineProps<{
  history: history;
}>();

const hasNextPage = computed(() => {
  if (Array.isArray(props.history)) {
    return props.history.length > limit.value + offset.value;
  }
  return false;
});
const sortedHistory = computed(() => {
  if (!Array.isArray(props.history)) {
    return [];
  } else {
    return props.history.slice().sort((tx1, tx2) => tx2.height - tx1.height);
  }
});

const transactions = computed<tableColumn[][]>(() => {
  return sortedHistory.value
    .slice(offset.value, offset.value + limit.value)
    ?.map((transaction) => [
      {
        text: transaction.tx_hash,
        url: `/tx/${transaction.tx_hash}`,
        short: true,
        copy: true,
      },
      {
        text: transaction.height,
        url: `/block/${transaction.height}`,
      },
    ]);
});
</script>
