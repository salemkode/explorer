<template>
  <div class="token-page container">
    <div class="column">
      <content-warp :items="tokenInfo" />
      <bcmr-info hide-icon :token-category="category" />
      <h5>Verifying by</h5>
      <ul class="list-group">
        <li
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          Bitcoin <img width="18" src="~/assets/icons/verified.svg" alt="" />
        </li>
        <li
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          BlockChair
          <img width="18" src="~/assets/icons/unverified.svg" alt="" />
        </li>
        <li
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          Any other provider
          <img width="18" src="~/assets/icons/verified.svg" alt="" />
        </li>
      </ul>
    </div>
    <div class="column">
      <div class="card">
        <div class="align-items-center d-flex flex-column p-3 flex-md-row">
          <bcmr-icon
            :token-category="category"
            :url="bcmrTokenData?.uris?.icon"
          />
          <div class="mx-2">
            <h6>
              {{
                bcmrTokenDataLoading
                  ? "Loading token name"
                  : bcmrTokenData?.name
              }}
            </h6>
            <Copy copy :text="category" />
          </div>
        </div>
      </div>
      <TokenAddress :category="category" />
      <TokenTransaction :category="category" />
      <TokenChild :token-child="tokenChild" :loading="tokenChildLoading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore, useBcmrStore } from "~/store";
import {
  GetTokenChild,
  GetTokenChildQuery,
  GetToken,
  GetTokenQuery,
} from "~/module/chaingraph";
import { getTokenType } from "~/module/utils";

const category = toRef(useRoute().params, "category") as Ref<string>;

const { result: bcmrTokenData, loading: bcmrTokenDataLoading } = toRefs(
  useBcmrStore().getTokenInfo(category.value)
);

const appStore = useAppStore();
const variable = computed(() => ({
  network: appStore.network,
  tokenCategory: "\\x" + category.value,
}));
const { result: tokenTransaction } = useQuery<GetTokenQuery>(
  GetToken,
  variable
);
const { result: tokenChild, loading: tokenChildLoading } =
  useQuery<GetTokenChildQuery>(GetTokenChild, variable);
const tokenInfo = computed(() => {
  const genesisTx = tokenTransaction.value?.transaction[0].hash.substring(2);
  const outputs = tokenTransaction.value?.transaction[0].outputs;
  const totalSupplyNFTs = tokenChild.value?.output?.length || 0;
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
      title: "Token Type",
      text: getTokenType(genesisSupply, totalSupplyNFTs),
    },
    {
      title: "Genesis Supply",
      text: genesisSupply,
    },
    {
      title: "Genesis Transaction",
      text: genesisTx,
      url: `tx/${genesisTx}`,
      copy: true,
    },
    {
      title: "Total Supply NFTs",
      text: totalSupplyNFTs,
    },
  ];
});
</script>

<style>
.token-page {
  display: grid;
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
