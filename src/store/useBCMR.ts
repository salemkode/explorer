import { BCMR, Network, initProviders } from "mainnet-js";
import { IdentitySnapshot } from "mainnet-js/dist/module/wallet/bcmr-v1.schema";
import { defineStore } from "pinia";

export const useBcmrStore = defineStore("bcmr", () => {
  const tokens = shallowRef(new Map<string, IdentitySnapshot>());

  const addToken = async (tokenCategory: string) => {
    if (tokens.value.get(tokenCategory)) return;
    await initProviders(["testnet"]);
    const authChain = await BCMR.buildAuthChain({
      transactionHash: tokenCategory,
      followToHead: true,
      network: Network.TESTNET,
    });
    await BCMR.addMetadataRegistryFromUri(authChain[0].uri);
    const tokenInfo = BCMR.getTokenInfo(tokenCategory);
    console.log(tokenInfo);
    if (tokenInfo) {
      tokens.value.set(tokenCategory, tokenInfo);
      triggerRef(tokens);
    }
  };

  return { tokens, addToken };
});
