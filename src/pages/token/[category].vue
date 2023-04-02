<template>
  <LoadingView v-if="tokenTransactionLoading" />
  <div v-else class="token-page overflow-hidden container d-md-grid">
    <TokenId
      :loading="bcmrToken.value.loading"
      :identity-snapshot="bcmrToken.value.identity"
      :category="category"
      class="d-md-none"
    />
    <TokenNav v-model:nav-item="navItem" />
    <div
      class="column d-md-block"
      :class="{
        'd-none': navItem === 0,
      }"
    >
      <content-warp :items="tokenInfo" :loading="tokenTransactionLoading" />
      <bcmr-info
        :loading="bcmrToken.value.loading"
        :identity-snapshot="bcmrToken.value.identity"
      />
      <TokenProvider :category="category" />
    </div>
    <div
      class="column d-md-block"
      :class="{
        'd-none': navItem === 1,
      }"
    >
      <TokenId
        :loading="bcmrToken.value.loading"
        :identity-snapshot="bcmrToken.value.identity"
        :category="category"
        class="d-none d-md-block"
      />
      <TokenAddress
        v-if="
          !tokenTransaction?.transaction?.at(0)?.outputs.at(0)
            ?.nonfungible_token_capability
        "
        :category="category"
      />
      <TokenTransaction :category="category" />
      <TokenChild
        :identity-snapshot="bcmrToken.value.identity"
        :category="category"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore, useBcmrStore } from "~/store";
import { GetToken, GetTokenQuery } from "~/module/chaingraph";
import { lockingBytecodeHexToCashAddress } from "~/module/utils";

const route = useRoute();
const category = computed(() => route.params.category as string);

const bcmrStore = useBcmrStore();
const appStore = useAppStore();
const navItem = ref(0);
const variable = computed(() => ({
  network: appStore.network,
  tokenCategory: "\\x" + category.value,
}));
const { result: tokenTransaction, loading: tokenTransactionLoading } =
  useQuery<GetTokenQuery>(GetToken, variable);

const opreturn = computed(() => {
  const outputs = tokenTransaction.value?.transaction.at(0)?.outputs;
  return outputs
    ?.find((vout) => vout.locking_bytecode.startsWith("\\x6a"))
    ?.locking_bytecode.substring(2);
});
const bcmrToken = computed(() => {
  const result = bcmrStore.getTokenInfo(category.value, opreturn.value || "");

  return result;
});
const tokenInfo = computed(() => {
  const genesisTx = tokenTransaction.value?.transaction
    .at(0)
    ?.hash.substring(2);
  const outputs = tokenTransaction.value?.transaction?.at(0)?.outputs;
  const nftCapability = outputs?.at(0)?.nonfungible_token_capability;
  const address = lockingBytecodeHexToCashAddress(
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

  return [
    {
      title: "Genesis Transaction",
      text: genesisTx,
      url: `/tx/${genesisTx}`,
      copy: true,
    },
    {
      title: "Genesis Supply",
      text: genesisSupply,
    },
    {
      title: "NFT Capability",
      text: nftCapability ? `${nftCapability} NFTs` : undefined,
    },
    {
      title: "Owner address",
      text: ownerAddress,
    },
  ];
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
