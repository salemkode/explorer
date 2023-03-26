import { BCMR, Network, initProviders } from "mainnet-js";
import { IdentitySnapshot } from "mainnet-js/dist/module/wallet/bcmr-v1.schema";
import { defineStore } from "pinia";

export const useBcmrStore = defineStore("bcmr", () => {
  const tokens = ref(new Map<string, IdentitySnapshot>());

  const getTokenInfo = (tokenCategory: string) => {
    const loading = ref(true);
    const result = computed(() => tokens.value.get(tokenCategory));

    if (tokens.value.get(tokenCategory)) {
      loading.value = false;
      return { result, loading };
    }

    initProviders(["testnet"]).then(async () => {
      await BCMR.addMetadataRegistryAuthChain({
        transactionHash: tokenCategory,
        followToHead: true,
        network: Network.TESTNET,
      }).catch(() => undefined);
      const tokenInfo = BCMR.getTokenInfo(tokenCategory);
      loading.value = false;
      if (tokenInfo) {
        tokens.value.set(tokenCategory, tokenInfo);
      }
    });

    return {
      result,
      loading,
    };
  };

  return { tokens, getTokenInfo };
});
