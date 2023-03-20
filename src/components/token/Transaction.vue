<template>
  <client-only>
    <div class="card">
      <h3 class="p-3">Token Transaction</h3>
      <LoadingVue v-if="loading" class="my-5 py-5" />
      <div
        v-else-if="transactions && !transactions.length"
        class="m-auto py-5 my-5"
      >
        There was an error.
      </div>
      <TableView
        v-else-if="transactions"
        :rows="transactions"
        :columns="['txid', 'block_height', 'block_time']"
      />
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { GetTokenTxs, GetTokenTxsQuery } from "@/module/chaingraph";
import { tableColumn } from "~/types/index.js";
import { useAppStore } from "~/store";
import { formatDateString } from "~/module/utils";

const props = defineProps<{
  category: string;
}>();
const appStore = useAppStore();
const variables = computed(() => ({
  network: appStore.network,
  tokenCategory: "\\x" + props.category,
}));

const { result: transaction, loading } = useQuery<GetTokenTxsQuery>(
  GetTokenTxs,
  variables
);

const transactions = computed<tableColumn[][] | undefined>(() =>
  transaction.value?.block_transaction.map(({ block, transaction }) => [
    {
      text: transaction.hash.substring(2),
      short: true,
      copy: true,
      url: `/tx/${transaction.hash.substring(2)}`,
    },
    {
      text: block.height,
      url: `/block/${block.height}`,
    },
    {
      text: formatDateString(new Date(+block.timestamp * 1000)),
    },
  ])
);
</script>
