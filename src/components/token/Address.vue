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
import { GetTokenAddress } from "~/module/chaingraph";
import { useStateStore } from "~/store";
import { calculateDecimal, removeAddressPrefix } from "~/module/bitcoin";
import type { tableColumn } from "~/types";

const limit = ref(9);
const offset = ref(0);
const props = defineProps<{
  category: string;
  decimals: number;
}>();
const stateStore = useStateStore();
const variables = computed(() => ({
  network: stateStore.network,
  tokenCategory: `\\x${props.category}` as const,
  offset: offset.value,
  limit: limit.value,
}));

const {
  result: tokenAddress,
  loading,
  error,
} = useQuery(GetTokenAddress, variables);
const hasNextPage = computed(() => {
  if (tokenAddress.value) {
    return tokenAddress.value.output.length === limit.value;
  }
  return false;
});

const addressList = computed(() => {
  // Return empty array when tokenAddress not found
  if (!tokenAddress.value) return [];

  // Calculate the sum of fungible_token_amount values for each unique locking_bytecode key
  const lockingBytecode = tokenAddress.value.output.reduce((map, address) => {
    // Retrieve the current amount associated with the locking_bytecode key from the map
    const currentAmount = map.get(address.locking_bytecode) || 0;

    // Update the map by setting the sum of the current amount and fungible_token_amount
    return map.set(
      address.locking_bytecode,
      currentAmount + Number(address.fungible_token_amount)
    );
  }, new Map<`\\x${string}`, number>());

  let items: tableColumn[][] = Array.from(
    lockingBytecode,
    function ([lockingBytecode, amount]) {
      const address = stateStore.lockingBytecodeHexToCashAddress(
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
          text: calculateDecimal(amount, props.decimals).toString(),
        },
      ];
    }
  ).filter((item) => item.length > 0);

  if (items.length === limit.value) {
    items = items.slice(0, -1);
  }

  return items;
});
</script>
