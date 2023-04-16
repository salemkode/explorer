<template>
  <LoadingView v-if="tokenTransactionLoading" />
  <div v-else class="token-page overflow-hidden container d-lg-grid">
    <TokenId
      :loading="bcmrToken.value.loading"
      :identity-snapshot="bcmrToken.value.identity"
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
        :loading="bcmrToken.value.loading"
        :identity-snapshot="bcmrToken.value.identity"
      />
      <TokenProvider :category="category" />
    </div>
    <div
      class="column d-lg-block"
      :class="{
        'd-none': navItem === 0,
      }"
    >
      <TokenId
        :loading="bcmrToken.value.loading"
        :identity-snapshot="bcmrToken.value.identity"
        :category="category"
        class="d-none d-lg-block"
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
import { GetToken, type GetTokenQuery } from "~/module/chaingraph";
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
  const result = bcmrStore.getTokenOpreturn(
    category.value,
    opreturn.value || ""
  );

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

  const items: contentWarp[] = [
    {
      title: "Genesis Transaction",
      text: genesisTx,
      url: `/tx/${genesisTx}`,
      copy: true,
      warp: true,
    },
    {
      title: "Genesis Supply",
      text: genesisSupply,
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
