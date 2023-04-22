<template>
  <TableView
    title="Token Addresses"
    :rows="addressList"
    :columns="['address', 'amount']"
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
  type GetTokenAddressQuery,
  GetTokenAddress,
} from "~/module/chaingraph";
import { useAppStore } from "~/store";
import { removeAddressPrefix } from "~/module/utils";
import type { tableColumn } from "~/types";

const limit = ref(9);
const offset = ref(0);
const props = defineProps<{
  category: string;
}>();
const appStore = useAppStore();
const variables = computed(() => ({
  network: appStore.network,
  tokenCategory: "\\x" + props.category,
  offset: offset.value,
  limit: limit.value,
}));

const {
  result: tokenAddress,
  loading,
  error,
} = useQuery<GetTokenAddressQuery>(GetTokenAddress, variables);
const hasNextPage = computed(() => {
  if (tokenAddress.value) {
    return tokenAddress.value.output.length === limit.value;
  }
  return false;
});

const addressList = computed(() => {
  const locking_bytecode = new Map<string, number>();
  if (tokenAddress.value) {
    tokenAddress.value.output.forEach((item) => {
      const inMapItem = locking_bytecode.get(item.locking_bytecode);
      if (inMapItem) {
        locking_bytecode.set(
          item.locking_bytecode,
          inMapItem + Number(item.fungible_token_amount)
        );
      } else {
        locking_bytecode.set(
          item.locking_bytecode,
          Number(item.fungible_token_amount)
        );
      }
    });
  }
  let items: tableColumn[][] = Array.from(
    locking_bytecode,
    function ([lockingBytecode, amount]) {
      const address = appStore.lockingBytecodeHexToCashAddress(
        lockingBytecode.substring(2)
      );
      if (typeof address !== "string") {
        return [];
      }
      return [
        {
          text: removeAddressPrefix(address),
          copy: true,
          short: true,
          url: `/address/${address}`,
        },
        {
          text: amount,
        },
      ];
    }
  ).filter((item) => item.length);

  if (items.length === limit.value) {
    items = items.slice(0, -1);
  }

  return items;
});
</script>
