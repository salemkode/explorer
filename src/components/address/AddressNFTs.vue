<template>
  <TableView
    title="Address NFTs"
    :rows="transactions"
    :columns="['nft', 'category', 'capability', 'commitment']"
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
  type GetAddressNfTsQuery,
  type GetAuthChainsQuery,
  GetAddressNFTs,
  GetAuthChains,
} from "@/module/chaingraph";
import type { tableColumn } from "~/types/index.js";
import { useStateStore, useRegistryStore } from "~/store";
import { decodeAuthChain } from "~/module/bcmr";

const limit = ref(9);
const offset = ref(0);
const props = defineProps<{
  lockingBytecode: string;
}>();
const stateStore = useStateStore();
const registryStore = useRegistryStore();
const variables = computed(() => ({
  network: stateStore.network,
  lockingBytecode: `{${props.lockingBytecode}}`,
  offset: offset.value,
  limit: limit.value,
}));

const {
  result: transaction,
  error,
  loading,
  onResult,
} = useQuery<GetAddressNfTsQuery>(GetAddressNFTs, variables);
const hasNextPage = computed(() => {
  if (transaction.value) {
    return transaction.value.search_output.length === limit.value;
  }
  return false;
});

onResult((transaction) => {
  const tokenCategories = transaction.data.search_output
    .map((nft) => nft.token_category)
    .filter(Boolean);

  const { onResult } = useQuery<GetAuthChainsQuery>(GetAuthChains, {
    network: stateStore.network,
    tokenCategory: Array.from(new Set(tokenCategories)),
  });

  onResult((authChain) => {
    tokenCategories.forEach((category) => {
      // Get token category
      const authchainElement = decodeAuthChain(
        authChain.data,
        category.substring(2)
      );
      if (!authchainElement) return;

      registryStore.addToken(category.substring(2), authchainElement.opreturn);
    });
  });
});
const transactions = computed(() => {
  if (!transaction.value) {
    return [];
  }
  let items: tableColumn[][] = transaction.value?.search_output.map((nft) => {
    const category = nft.token_category?.substring(2) || "";
    const commitment = nft.nonfungible_token_commitment?.substring(2) || "";

    // BCMR Data
    const metadata = registryStore.getToken(
      category,
      nft.nonfungible_token_capability || undefined,
      commitment
    );

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
        text: nft.nonfungible_token_capability || "N/A",
      },
      {
        text: commitment || "N/A",
      },
    ];
  });

  if (items.length === limit.value) {
    items = items.slice(0, -1);
  }

  return items;
});
</script>
