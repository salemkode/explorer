<template>
  <TableView
    title="NFT Child"
    :rows="outputs"
    :columns="column"
    :has-prev-page="!!offset"
    :has-next-page="!!hasNextPage"
    :loading="loading"
    :error="error?.message"
    @next="offset += 8"
    @previous="offset -= 8"
  />
</template>

<script setup lang="ts">
import { GetTokenChild, type GetTokenChildQuery } from "@/module/chaingraph";
import type { IdentitySnapshot, tableColumn } from "~/types/index.js";
import { removeAddressPrefix } from "~/module/bitcoin";
import { useStateStore } from "~/store";

const stateStore = useStateStore();
const limit = ref(9);
const offset = ref(0);
const props = defineProps<{
  category: string;
  identitySnapshot?: IdentitySnapshot;
}>();
const variable = computed(() => ({
  network: stateStore.network,
  tokenCategory: "\\x" + props.category,
  offset: offset.value,
  limit: limit.value,
}));
const { result, loading, error } = useQuery<GetTokenChildQuery>(
  GetTokenChild,
  variable
);
const types = computed(() => props.identitySnapshot?.token?.nfts?.parse.types);
const showTokenColumn = computed(() => {
  return Object.keys(types.value || {}).length !== 0;
});
const column = computed(() => {
  const result = ["token", "address", "capability", "commitment"];

  // Remove token column if there is no token info
  if (!showTokenColumn.value) {
    result.shift();
  }
  return result;
});
const hasNextPage = computed(() => {
  if (result.value) {
    return result.value.output.length === limit.value;
  }
  return false;
});
const outputs = computed<tableColumn[][]>(() => {
  if (!result.value) {
    return [];
  }

  let items = result.value?.output.map((output) => {
    // Convert locking bytecode to cash address
    const address = stateStore.lockingBytecodeHexToCashAddress(
      output.locking_bytecode.substring(2)
    );
    // Get nonfungible token commitment
    const commitment = output.nonfungible_token_commitment?.substring(2);
    const item: tableColumn[] = [
      {
        text: output.nonfungible_token_capability?.toString() || "N/A",
      },
      {
        text: commitment || "N/A",
      },
    ];

    // Add address column
    if (typeof address === "string") {
      item.unshift({
        text: removeAddressPrefix(address),
        copy: true,
        short: true,
        url: `/address/${address}`,
      });
    } else {
      item.unshift({
        text: "N/A",
      });
    }

    // Add child info column
    if (showTokenColumn && typeof commitment === "string") {
      item.unshift({
        text: types.value?.[commitment].name || "N/A",
        token: {
          category: props.category,
          commitment,
          capability: output.nonfungible_token_capability || undefined,
        },
      });
    }

    return item;
  });

  // Remove last item if it reaches the limit
  if (items.length === limit.value) {
    items = items.slice(0, -1);
  }
  return items;
});
</script>
