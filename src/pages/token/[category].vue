<template>
  <LoadingView v-if="tokenTransactionLoading" />
  <div v-else class="token-page overflow-hidden container d-lg-grid">
    <TokenId
      :loading="metadata.loading"
      :identity-snapshot="metadata.identitySnapshot"
      :category="category"
      class="d-lg-none"
    />
    <NavPills
      v-model:select="navItem"
      :items="['token_register', 'transaction']"
      class="d-lg-none"
    />
    <div
      class="column d-lg-block"
      :class="{
        'd-none': navItem === 1,
      }"
    >
      <content-warp :items="tokenInfo" :loading="tokenTransactionLoading" />
      <bcmr-info
        :loading="metadata.loading"
        :identity-snapshot="metadata.identitySnapshot"
      />
      <TokenProvider
        :select="metadata.name"
        :category="category"
        @select="(url) => (selectedRegistryName = url)"
      />
    </div>
    <div
      class="column d-lg-block"
      :class="{
        'd-none': navItem === 0,
      }"
    >
      <TokenId
        :loading="metadata.loading"
        :identity-snapshot="metadata.identitySnapshot"
        :category="category"
        class="d-none d-lg-block"
      />
      <TokenAddress
        v-if="
          !tokenTransaction?.transaction?.at(0)?.outputs.at(0)
            ?.nonfungible_token_capability
        "
        :decimals="decimals"
        :category="category"
      />
      <TokenTransaction :category="category" />
      <TokenChild
        :identity-snapshot="metadata.identitySnapshot"
        :category="category"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStateStore, useRegistryStore } from "~/store";
import { GetToken, type GetTokenQuery } from "~/module/chaingraph";
import type { contentWarpItem } from "~/types";
import { calculateDecimal } from "~/module/bitcoin";

const route = useRoute();
const category = computed(() => route.params.category as string);

const registryStore = useRegistryStore();
const stateStore = useStateStore();
const navItem = ref(0);
const variable = computed(() => ({
  network: stateStore.network,
  tokenCategory: ["\\x" + category.value],
}));
const {
  result: tokenTransaction,
  loading: tokenTransactionLoading,
  onResult,
  onError,
} = useQuery<GetTokenQuery>(GetToken, variable);

onError(() => {
  throw showError({
    statusCode: 404,
    message: "This transaction is not found",
  });
});
onResult(() => {
  if (!tokenTransaction.value || !tokenTransaction.value.transaction.length) {
    throw showError({
      statusCode: 404,
      message: "This transaction is not found",
    });
  }
});

watch(
  [category, tokenTransaction],
  () => {
    const outputs = tokenTransaction.value?.transaction.at(0)?.outputs;
    const opreturn = outputs
      ?.find((vout) => vout.locking_bytecode.startsWith("\\x6a"))
      ?.locking_bytecode.substring(2);

    registryStore.addToken(category.value, opreturn || "");
  },
  { immediate: true }
);

const selectedRegistryName = ref("");
const metadata = computed(() => {
  const isOpreturnLoading =
    registryStore.opreturns.get(category.value) === true;
  const registryState = registryStore.getTokenIdentity(
    category.value,
    selectedRegistryName.value
  );

  return {
    loading: registryStore.loadingProviders || isOpreturnLoading,
    name: registryState?.name || "",
    identitySnapshot: registryState?.identity,
  };
});
const decimals = computed(
  () => metadata.value.identitySnapshot?.token?.decimals || 0
);
const tokenInfo = computed(() => {
  const genesisTx = tokenTransaction.value?.transaction
    .at(0)
    ?.hash.substring(2);
  const outputs = tokenTransaction.value?.transaction?.at(0)?.outputs;
  const nftCapability = outputs?.at(0)?.nonfungible_token_capability;
  const address = stateStore.lockingBytecodeHexToCashAddress(
    outputs?.at(0)?.locking_bytecode.substring(2) || ""
  );
  const ownerAddress = typeof address === "string" ? address : undefined;

  let genesisSupply = 0;
  if (outputs) {
    genesisSupply = outputs.reduce(
      (total: number, { fungible_token_amount }) =>
        fungible_token_amount ? total + parseInt(fungible_token_amount) : total,
      0
    );
  }

  const items: contentWarpItem[] = [
    {
      title: "Genesis Transaction",
      text: genesisTx,
      url: `/tx/${genesisTx}`,
      copy: true,
      warp: true,
    },
    {
      title: "Genesis Supply",
      text: calculateDecimal(genesisSupply, decimals.value || 0).toString(),
    },
    {
      title: "Token type",
      text: nftCapability ? `${nftCapability} NFTs` : "Fungible Tokens",
    },
  ];
  if (nftCapability && ownerAddress) {
    items.push({
      title: "NFT owner",
      text: ownerAddress,
      url: `/address/${ownerAddress}`,
      copy: true,
    });
  }

  return items;
});
</script>

<style>
.token-page {
  grid-template-columns: 1fr 2.5fr;
  gap: 15px;
}
.token-page .column {
  overflow-x: hidden;
}
.token-page .column > * {
  margin-top: 10px;
}
</style>
