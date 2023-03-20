<template>
  <client-only>
    <div class="card">
      <h3 class="p-3">Token Address</h3>
      <LoadingVue v-if="loading" class="my-5 py-5" />
      <div
        v-else-if="addressList && !addressList.length"
        class="m-auto py-5 my-5"
      >
        There was an error.
      </div>
      <TableView
        v-else-if="addressList"
        :rows="addressList"
        :columns="['address', 'amount']"
      />
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { GetTokenAddress, GetTokenAddressQuery } from "@/module/chaingraph";
import { useAppStore } from "~/store";
import { lockingBytecodeHexToCashAddress } from "~/module/utils";

const props = defineProps<{
  category: string;
}>();
const appStore = useAppStore();
const variables = computed(() => ({
  network: appStore.network,
  tokenCategory: "\\x" + props.category,
}));

const { result: tokenAddress, loading } = useQuery<GetTokenAddressQuery>(
  GetTokenAddress,
  variables
);
const addressList = computed(() => {
  const locking_bytecode = new Map<string, number>();
  if (tokenAddress.value) {
    tokenAddress.value.output
      .filter((output) => output.spent_by.length === 0)
      .forEach((item) => {
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

  return Array.from(locking_bytecode, function ([lockingBytecode, amount]) {
    const address = lockingBytecodeHexToCashAddress(
      lockingBytecode.substring(2)
    ) as string;
    return [
      {
        text: address,
        copy: true,
        url: `/address/${address}`,
      },
      {
        text: amount,
      },
    ];
  });
});
</script>
