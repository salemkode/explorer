<template>
  <TableView
    title="Address Tokens"
    :rows="transactions"
    :columns="['token', 'category', 'amount']"
    :has-prev-page="!!offset"
    :has-next-page="!!hasNextPage"
    :loading="loading"
    :error="error?.message"
    @next="offset += 8"
    @previous="offset -= 8"
  />
</template>

<script setup lang="ts">
import {
  GetAddressTokens,
  GetToken,
  type GetAddressTokensQuery,
  type GetTokenQuery,
} from "@/module/chaingraph";
import type { tableColumn } from "~/types/index.js";
import { useAppStore, useBcmrStore } from "~/store";

const limit = ref(9);
const offset = ref(0);
const props = defineProps<{
  lockingBytecode: string;
}>();
const appStore = useAppStore();
const variables = computed(() => ({
  network: appStore.network,
  lockingBytecode: `{${props.lockingBytecode}}`,
  offset: offset.value,
  limit: limit.value,
}));

const bcmrStore = useBcmrStore();
const {
  result: transaction,
  error,
  loading,
  onResult,
} = useQuery<GetAddressTokensQuery>(GetAddressTokens, variables);
const hasNextPage = computed(() => {
  if (transaction.value) {
    return transaction.value.search_output.length === limit.value;
  }
  return false;
});
const transactions = computed<tableColumn[][]>(() => {
  if (!transaction.value) {
    return [];
  }
  let outputs = transaction.value?.search_output;
  if (outputs.length === limit.value) {
    outputs = outputs.slice(0, -1);
  }

  // Remove duplicate
  const tokens = new Map<string, number>();
  outputs.forEach((item) => {
    if (!item.token_category) return;

    const inMapItem = tokens.get(item.token_category);
    if (inMapItem) {
      tokens.set(
        item.token_category,
        inMapItem + Number(item.fungible_token_amount)
      );
    } else {
      tokens.set(item.token_category, Number(item.fungible_token_amount));
    }
  });

  const items = Array.from(tokens, ([categoryBytea, amount]) => {
    const category = categoryBytea?.substring(2) || "";
    const metadata = bcmrStore.getToken(category);

    return [
      {
        text: metadata?.loading
          ? "Loading..."
          : metadata?.token?.name || "No name",
        token: {
          category: category,
          url: metadata?.token?.icon || "",
        },
      },
      {
        text: category,
        short: true,
        copy: true,
        url: `/token/${category}`,
      },
      {
        text: amount || "N/A",
      },
    ];
  });

  return items;
});

onResult((transaction) => {
  transaction.data.search_output.forEach((token) => {
    if (!token.token_category) return;
    const category = token.token_category;

    const { onResult } = useQuery<GetTokenQuery>(GetToken, {
      network: appStore.network,
      tokenCategory: category,
    });

    onResult((tokenTransaction) => {
      const outputs = tokenTransaction.data?.transaction.at(0)?.outputs;
      const opreturn = outputs
        ?.find((vout) => vout.locking_bytecode.startsWith("\\x6a"))
        ?.locking_bytecode.substring(2);

      if (opreturn) {
        bcmrStore.addToken(category.substring(2), opreturn);
      }
    });
  });
});
</script>
