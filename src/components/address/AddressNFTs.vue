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
  GetAddressNFTs,
  GetAddressNfTsQuery,
  GetToken,
  GetTokenQuery,
} from "@/module/chaingraph";
import { tableColumn } from "~/types/index.js";
import { useAppStore, useBcmrStore } from "~/store";

const limit = ref(9);
const offset = ref(0);
const props = defineProps<{
  lockingBytecode: string;
}>();
const appStore = useAppStore();
const bcmrStore = useBcmrStore();
const variables = computed(() => ({
  network: appStore.network,
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
const transactions = computed(() => {
  if (!transaction.value) {
    return [];
  }
  let items: tableColumn[][] = transaction.value?.search_output.map((nft) => {
    const category = nft.token_category?.substring(2) || "";
    const commitment = nft.nonfungible_token_commitment?.substring(2) || "";

    // BCMR Data
    const metadata = bcmrStore.getToken(
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
