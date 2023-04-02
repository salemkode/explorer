import { binToUtf8, utf8ToBin, binToHex, hexToBin } from "@bitauth/libauth";
import { OpReturnData, sha256 } from "mainnet-js";
import { defineStore } from "pinia";
import { Registry } from "~/types";

// TODO: move to app store and create watch for network change
const providersUrls = {
  Mathieu:
    "https://raw.githubusercontent.com/mr-zwets/example_bcmr/main/example_bcmr.json",
};
export const useBcmrStore = defineStore("bcmr", () => {
  const opreturns = reactive(new Map<string, Registry | boolean>());
  const opreturnsVerified = reactive(new Map<string, boolean>());
  const providers = reactive(new Map<string, Registry | boolean>());

  (async () => {
    const promises = Object.entries(providersUrls).map(async ([name, url]) => {
      try {
        providers.set(name, true);
        const response = await fetch(url);
        const json = await response.json();
        providers.set(name, json);
      } catch (error) {
        providers.set(name, false);
      }
    });

    await Promise.all(promises);
  })();

  const validateBCMR = (chunks: Uint8Array[]) => {
    if (
      (chunks.length === 2 || chunks.length === 3) &&
      binToUtf8(chunks.at(0)) === "BCMR"
    ) {
      return;
    }
    return "Invalid BCMR OP_RETURN";
  };

  const opreturnToAuthChain = (opReturnHex: string) => {
    const chunks = OpReturnData.parseBinary(hexToBin(opReturnHex));
    const result = {
      contentHash: "",
      url: "",
    };

    if (validateBCMR(chunks)) {
      return "Invalid BCMR OP_RETURN";
    }

    if (chunks.length === 2) {
      // IPFS Publication Output
      result.contentHash = binToHex(chunks[1]);
      const ipfsCid = binToUtf8(chunks[1]);
      result.url = `https://dweb.link/ipfs/${ipfsCid}`;
    } else {
      // HTTPS Publication Output
      // content hash is in OP_SHA256 byte order per spec
      result.contentHash = binToHex(chunks[1].slice().reverse());
      result.url = binToUtf8(chunks[2]);
      if (result.url.indexOf("https://") < 0) {
        result.url = `https://${result.url}`;
      }
    }

    return result;
  };

  const getTokenFromRegister = (registry: Registry, tokenCategory: string) => {
    const identities = registry?.identities;
    if (identities && identities[tokenCategory]) {
      const identity = identities[tokenCategory].find(
        (identity) => identity.token?.category === tokenCategory
      );
      if (identity) {
        return identity;
      }
    }
  };

  const getTokenInfo = (tokenCategory: string, opReturnHex: string) => {
    const result = computed(() => {
      const registry = opreturns.get(tokenCategory);
      if (registry === true) {
        return {
          verified: false,
          loading: true,
          identity: undefined,
        };
      } else {
        return {
          verified: !!opreturnsVerified.get(tokenCategory),
          loading: false,
          identity: registry
            ? getTokenFromRegister(registry, tokenCategory)
            : undefined,
        };
      }
    });
    if (opreturns.get(tokenCategory) !== undefined) {
      return result;
    }

    const authChain = opreturnToAuthChain(opReturnHex);
    if (typeof authChain !== "string") {
      (async () => {
        opreturns.set(tokenCategory, true);
        const response = await fetch(authChain.url);
        if (response.status === 200) {
          opreturns.set(tokenCategory, false);
          const bcmrContent = await response.text();
          const hashContent = binToHex(sha256.hash(utf8ToBin(bcmrContent)));
          opreturnsVerified.set(
            tokenCategory,
            hashContent === authChain.contentHash
          );
          try {
            const registry: Registry = JSON.parse(bcmrContent);
            if (getTokenFromRegister(registry, tokenCategory)) {
              opreturns.set(tokenCategory, registry);
            }
          } catch (error) {
            console.log("Parsing error", error);
          }
        }
      })().finally(() => {
        // End loading
        if (opreturns.get(tokenCategory) === true)
          opreturns.set(tokenCategory, false);
      });
    }

    return result;
  };

  return {
    opreturns,
    opreturnsVerified,
    providers,
    getTokenInfo,
    opreturnToAuthChain,
  };
});
