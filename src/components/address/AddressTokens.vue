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
import { useStateStore, useRegistryStore } from "~/store";

const limit = ref(9);
const offset = ref(0);
const props = defineProps<{
  lockingBytecode: string;
}>();
const stateStore = useStateStore();
const variables = computed(() => ({
  network: stateStore.network,
  lockingBytecode: `{${props.lockingBytecode}}`,
  offset: offset.value,
  limit: limit.value,
}));

const registryStore = useRegistryStore();
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
    const metadata = registryStore.getToken(category);

    return [
      {
        text: metadata?.loading
          ? "Loading..."
          : metadata?.token?.name || "No name",
        token: {
          category: category,
          icon: metadata?.token?.icon || "",
        },
        url: `/token/${category}`,
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
  const tokenCategories = transaction.data.search_output
    .map((token) => token.token_category)
    .filter(Boolean);

  const { onResult } = useQuery<GetTokenQuery>(GetToken, {
    network: stateStore.network,
    tokenCategory: new Set(tokenCategories),
  });

  onResult((tokenTransaction) => {
    tokenTransaction.data.transaction.forEach((transaction) => {
      // Get token category
      const category = transaction.inputs[0].outpoint_transaction_hash;
      const opreturn = transaction.outputs
        ?.find((vout) => vout.locking_bytecode.startsWith("\\x6a"))
        ?.locking_bytecode.substring(2);

      if (opreturn) {
        registryStore.addToken(category.substring(2), opreturn);
      }
    });
  });
});
</script>
