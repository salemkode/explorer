import {
  binToUtf8,
  utf8ToBin,
  binToHex,
  hexToBin,
  sha256,
} from "@bitauth/libauth";
import { defineStore } from "pinia";
import { parseBinary } from "~/module/bitcoin";
import type { Registry, tokenCapability } from "~/types";
import type { ValidateFunction } from "ajv";

let validate_bcmr: ValidateFunction<Registry> | undefined;
const validateBcmrSchema = async (value: unknown) => {
  if (!validate_bcmr) {
    const { default: Ajv } = await import("ajv");
    const schema_bcmr = await import("@/assets/bcmr-v2.schema.json");

    // Create bitcoin cash metadata registry validator
    const ajv = new Ajv({
      strictTypes: false,
    });
    validate_bcmr = ajv.compile<Registry>(schema_bcmr);
  }

  return validate_bcmr(value);
};

// TODO: must be reactive value
const providersUrls = {
  Mathieu:
    "https://raw.githubusercontent.com/mr-zwets/example_bcmr/main/example_bcmr.json",
};

export const useBcmrStore = defineStore("bcmr", () => {
  const opreturnsRef = shallowRef(new Map<string, Registry | boolean>());
  const opreturns = {
    get: (key: string) => opreturnsRef.value.get(key),
    set(key: string, value: boolean | Registry) {
      opreturnsRef.value.set(key, value);
      triggerRef(opreturnsRef);
      return opreturnsRef.value;
    },
  };

  const opreturnsVerified = reactive(new Map<string, boolean>());
  const providers = reactive(new Map<string, Registry | boolean>());
  const loadedProviders = ref(false);
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

    await Promise.all(promises).finally(() => (loadedProviders.value = true));
  })();

  const validateBCMR = (chunks: Uint8Array[]) => {
    if (
      (chunks.length === 2 || chunks.length === 3) &&
      binToUtf8(chunks[0]) === "BCMR"
    ) {
      return;
    }
    return "Invalid BCMR OP_RETURN";
  };

  const opreturnToAuthChain = (opReturnHex: string) => {
    const chunks = parseBinary(hexToBin(opReturnHex));
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
      const identity = Object.values(identities[tokenCategory]).find(
        (identity) => identity.token?.category === tokenCategory
      );
      if (identity) {
        return identity;
      }
    }
  };

  const getRegistryHasCategory = (category: string) => {
    const opreturnResult = opreturns.get(category);
    if (typeof opreturnResult === "object") {
      return opreturnResult;
    } else {
      Array.from(providers).find(([, registry]) => {
        if (typeof registry === "object") {
          return registry.identities
            ? registry.identities[category]
            : undefined;
        }
      });
    }
  };

  const getToken = (
    category: string,
    nftType?: tokenCapability,
    nftCommitment?: string
  ) => {
    const registry = getRegistryHasCategory(category);
    let token:
      | {
          name: string;
          description?: string;
          symbol?: string;
          icon?: string;
        }
      | undefined;

    if (registry) {
      const identity = getTokenFromRegister(registry, category);
      if (identity) {
        if (nftType && nftType !== "minting") {
          if (!nftCommitment) {
            return {
              loading: false,
              token: undefined,
            };
          }
          const nftTypes = identity.token?.nfts?.parse.types || {};
          const child = nftTypes[nftCommitment];

          if (child) {
            token = {
              name: child.name,
              description: child.description,
              icon: child.uris ? child.uris["icon"] : undefined,
              symbol: undefined,
            };
          }
        } else {
          token = {
            name: identity.name,
            description: identity.description,
            symbol: identity.token?.symbol,
            icon: identity.uris ? identity.uris["icon"] : undefined,
          };
        }
      }
    }

    return {
      loading:
        loadedProviders.value === false || opreturns.get(category) === true,
      token,
    };
  };

  const addToken = (tokenCategory: string, opReturnHex: string) => {
    if (opreturns.get(tokenCategory) !== undefined) {
      return;
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
            // Parse BCMR registry
            const registry: Registry = JSON.parse(bcmrContent);

            // Validate BCMR registry
            const isValidSchema = await validateBcmrSchema(registry);
            if (!isValidSchema) return;

            // Validate token category
            if (getTokenFromRegister(registry, tokenCategory)) {
              opreturns.set(tokenCategory, registry);
            }
          } catch (error) {
            console.log("Parsing error: ", error);
          }
        }
      })().finally(() => {
        // End loading
        if (opreturns.get(tokenCategory) === true)
          opreturns.set(tokenCategory, false);
      });
    }
  };

  const getTokenOpreturn = (tokenCategory: string, opReturnHex: string) => {
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
    addToken(tokenCategory, opReturnHex);
    return result;
  };

  return {
    opreturnsRef,
    opreturns,
    opreturnsVerified,
    providers,
    loadedProviders,
    getToken,
    addToken,
    getTokenOpreturn,
    getTokenFromRegister,
    opreturnToAuthChain,
  };
});
