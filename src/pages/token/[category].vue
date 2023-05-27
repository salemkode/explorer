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
        v-if="authchain.genesesTx.nftCapability"
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
} = useQuery<GetAuthChainsQuery>(GetAuthChains, variable);

const authchain = computed(() => {
  const genesesTx = {
    hash: "",
    genesisSupply: 0,
    ownerAddress: undefined as string | undefined,
    nftCapability: "" as "none" | "mutable" | "minting" | null | undefined,
  };

  let result = {
    timestamp: "0",
    opreturn: "",
  };

  tokenTransaction.value?.transaction
    .at(0)
    ?.authchains.at(0)
    ?.migrations.forEach((migration) => {
      const transaction = migration?.transaction?.at(0);

      // Get token genesis information
      const isGenesesTx =
        transaction?.inputs.at(0)?.outpoint_transaction_hash.substring(2) ===
        category.value;

      if (isGenesesTx) {
        genesesTx.hash = transaction?.hash.substring(2) || "";
        genesesTx.genesisSupply = transaction.outputs.reduce(
          (total: number, { fungible_token_amount }) =>
            fungible_token_amount
              ? total + parseInt(fungible_token_amount)
              : total,
          0
        );
        genesesTx.nftCapability =
          transaction.outputs?.at(0)?.nonfungible_token_capability;
        genesesTx.ownerAddress = stateStore.lockingBytecodeHexToCashAddress(
          transaction.outputs?.at(0)?.locking_bytecode.substring(2) || ""
        );
      }

      // Get the opreturn from the first output
      const opreturn = transaction?.outputs
        ?.find((vout) => vout.locking_bytecode.startsWith("\\x6a"))
        ?.locking_bytecode.substring(2);
      const timestamp = transaction?.block_inclusions.at(0)?.block.timestamp;
      if (timestamp && opreturn && +result.timestamp < +timestamp) {
        result = {
          timestamp: timestamp,
          opreturn,
        };
      }
    });

  return {
    genesesTx,
    opreturn: result.opreturn,
  };
});
onError(() => {
  throw showError({
    statusCode: 404,
    message: "This transaction is not found",
  });
});
onResult(() => {
  if (!authchain.value.genesesTx.hash) {
    throw showError({
      statusCode: 404,
      message: "This transaction is not found",
    });
  }
});

watchEffect(() => {
  authchain.value.opreturn &&
    registryStore.addToken(category.value, authchain.value.opreturn);
});

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
  const {
    hash: genesisTx,
    genesisSupply,
    nftCapability,
    ownerAddress,
  } = authchain.value.genesesTx;
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
