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
import { removeAddressPrefix } from "~/module/utils";
import { useAppStore } from "~/store";

const appStore = useAppStore();
const limit = ref(9);
const offset = ref(0);
const props = defineProps<{
  category: string;
  identitySnapshot?: IdentitySnapshot;
}>();
const variable = computed(() => ({
  network: appStore.network,
  tokenCategory: "\\x" + props.category,
  offset: offset.value,
  limit: limit.value,
}));
const { result, loading, error } = useQuery<GetTokenChildQuery>(
  GetTokenChild,
  variable
);
const column = computed(() => {
  if (
    Object.keys(props.identitySnapshot?.token?.nfts?.parse.types || {}).length
  ) {
    return ["token", "address", "capability", "commitment"];
  }
  return ["address", "capability", "commitment"];
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
    const address = appStore.lockingBytecodeHexToCashAddress(
      output.locking_bytecode.substring(2)
    );
    const commitment = output.nonfungible_token_commitment?.substring(2);
    const item: tableColumn[] = [
      {
        text: output.nonfungible_token_capability?.toString() || "N/A",
      },
      {
        text: commitment || "N/A",
      },
    ];

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

    if (commitment) {
      const childInfo =
        props.identitySnapshot?.token?.nfts?.parse.types[commitment];
      if (childInfo?.uris?.icon) {
        item.unshift({
          text: childInfo?.name,
          token: {
            category: props.category,
            url: childInfo.uris.icon,
          },
        });
      }
    }

    return item;
  });

  if (items.length === limit.value) {
    items = items.slice(0, -1);
  }
  return items;
});
</script>
