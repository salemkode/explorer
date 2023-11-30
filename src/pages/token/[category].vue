<template>
  <div class="d-flex align-items-center justify-content-center">
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
  </div>
</template>

<script setup lang="ts">
import { useStateStore, useRegistryStore } from "~/store";
import type { contentWarpItem } from "~/types";
import { decodeAuthChain } from "~/module/bcmr";
import { useAuthChains } from "~/hooks/authchains";
import { useNftSupply } from "~/hooks/nftSupply";
import { useIsActiveMinting } from "~/hooks/activeMinting";
import { getTokenInfoType } from "~/module/bitcoin";

const route = useRoute();
const category = computed(() => route.params.category as string);

const registryStore = useRegistryStore();
const stateStore = useStateStore();
const navItem = ref(0);
const {
  result: authchain,
  loading: authchainLoading,
  onError,
} = useAuthChains(toRef(() => [`\\x${category.value}` as const]));

const { supplyNFTs } = useNftSupply(`\\x${category.value}`);
const { isActiveMinting } = useIsActiveMinting(`\\x${category.value}`);
const authchainElement = computed(
  () => authchain.value && decodeAuthChain(authchain.value, category.value)
);
const reservedSupply = computed(
  () =>
    authchain.value?.transaction
      .at(0)
      ?.authchains.at(0)
      ?.authhead?.identity_output?.at(0)?.fungible_token_amount
);
onError(() => {
  throw showError({
    statusCode: 404,
    message: "This transaction is not found",
  });
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
      title: "Token type",
      text: getTokenInfoType(genesisSupply, supplyNFTs.value),
    },
    {
      title: "Genesis Supply",
      text: genesisSupply || null,
    },
    {
      title: "Total amount NFTs",
      text: supplyNFTs.value || null,
    },
    {
      title: "Reserve supply",
      text: Number(reservedSupply.value) || null,
    },
    {
      title: "Circulating supply",
      text:
        Number(reservedSupply.value) > 0
          ? genesisSupply - Number(reservedSupply.value)
          : null,
    },
    {
      title: "Is active minting",
      text: isActiveMinting.value ? "Yes" : "No",
    },
  ];

  if (ownerAddress) {
    items.push({
      title: "Owner Address",
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
