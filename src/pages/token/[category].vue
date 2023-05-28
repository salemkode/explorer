<template>
  <LoadingView v-if="authchainLoading" />
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
      <content-warp
        v-if="tokenInfo"
        :items="tokenInfo"
        :loading="authchainLoading"
      />
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
        v-if="authchainElement?.genesesTx.nftCapability"
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
import { GetAuthChains, type GetAuthChainsQuery } from "~/module/chaingraph";
import type { contentWarpItem } from "~/types";
import { calculateDecimal } from "~/module/bitcoin";
import { decodeAuthChain } from "~/module/bcmr";

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
  result: authchain,
  loading: authchainLoading,
  onResult,
  onError,
} = useQuery<GetAuthChainsQuery>(GetAuthChains, variable);

const authchainElement = computed(
  () => authchain.value && decodeAuthChain(authchain.value, category.value)
);
onError(() => {
  throw showError({
    statusCode: 404,
    message: "This transaction is not found",
  });
});
onResult(() => {
  if (!authchainElement.value) {
    throw showError({
      statusCode: 404,
      message: "This transaction is not found",
    });
  }
});

watchEffect(() => {
  authchainElement.value?.opreturn &&
    registryStore.addToken(category.value, authchainElement.value.opreturn);
});

const selectedRegistryName = ref("");
const metadata = computed(() => {
  const isAuthchainLoading =
    registryStore.authchains.get(category.value) === true;
  const registryState = registryStore.getTokenIdentity(
    category.value,
    selectedRegistryName.value
  );

  return {
    loading: registryStore.loadingProviders || isAuthchainLoading,
    name: registryState?.name || "",
    identitySnapshot: registryState?.identity,
  };
});
const decimals = computed(
  () => metadata.value.identitySnapshot?.token?.decimals || 0
);
const tokenInfo = computed(() => {
  if (!authchainElement.value) return;
  const {
    hash: genesisTx,
    genesisSupply,
    nftCapability,
    lockingBytecode,
  } = authchainElement.value.genesesTx;
  const ownerAddress =
    lockingBytecode &&
    stateStore.lockingBytecodeHexToCashAddress(lockingBytecode);

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
