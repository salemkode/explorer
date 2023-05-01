import {
  binToUtf8,
  utf8ToBin,
  binToHex,
  hexToBin,
  sha256,
} from "@bitauth/libauth";
import { defineStore } from "pinia";
import { parseBinary } from "~/module/bitcoin";
import { validateBcmrSchema } from "~/module/utils";
import type { Registry, RegistryProvider, tokenCapability } from "~/types";

const defaultProviders: RegistryProvider[] = [
  {
    name: "BitJson",
    url: "https://raw.githubusercontent.com/bitjson/chip-bcmr/373322b98861b5d080b167701a990a3ba108d9c7/examples/fungible-token.json",
    enable: true,
    default: true,
  },
  {
    name: "SalemKode",
    url: "https://gist.githubusercontent.com/salemkode/c60a7d233fd2011cbe943fedd9c67c5d/raw/46a81bd4cb7bb5294731d93bff14346be9a265e5/registry.json",
    enable: true,
    default: true,
  },
];
export const useRegistryStore = defineStore(
  "registry",
  () => {
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

    const registryProviders = reactive(new Map<string, Registry>());
    const loadingProviders = ref(true);
    const registryList = reactive([] as RegistryProvider[]);

    const isRegistryProviderExist = (name: string, url: string) => {
      return !!registryList.find(
        (item) => item.name === name || item.url === url
      );
    };

    const addRegistryProvider = async (name: string, url: string) => {
      // Check is url valid using regex
      const urlPattern =
        /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
      if (!urlPattern.test(url)) {
        return {
          error: "Invalid URL",
        };
      }
      const responseRegistry = await fetch(url).then((res) => res.json());

      // Validate BCMR registry
      const registry = await validateBcmrSchema(responseRegistry);
      if (!registry.success) {
        return {
          error: "Invalid BCMR registry schema",
        };
      }

      // Add providers to registryProviders
      !isRegistryProviderExist(name, url) &&
        registryList.push({ name, url, enable: true, default: false });
      registryProviders.set(name, registry.value);
      return "Success";
    };

    (() => {
      if (registryList.length === 0) {
        registryList.push(...defaultProviders);
      } else {
        defaultProviders.forEach((item) => {
          if (!isRegistryProviderExist(item.name, item.url)) {
            registryList.push(item);
          }
        });
      }
      const promises = registryList.map((item) =>
        addRegistryProvider(item.name, item.url).then(console.log)
      );

      // End loading
      Promise.all(promises).then(() => {
        loadingProviders.value = false;
      });
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

    const getTokenFromRegister = (
      registry: Registry,
      tokenCategory: string
    ) => {
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return Array.from(registryProviders, ([_, registry]) => registry).find(
          ({ identities }) => (identities ? identities[category] : undefined)
        );
      }
    };

    const getTokenIdentity = (category: string) => {
      const registry = getRegistryHasCategory(category);
      if (registry) {
        const identity = getTokenFromRegister(registry, category);
        if (identity) {
          return identity;
        }
      }
    };

    const getToken = (
      category: string,
      nftType?: tokenCapability,
      nftCommitment?: string
    ) => {
      const identity = getTokenIdentity(category);
      let token:
        | {
            name: string;
            description?: string;
            symbol?: string;
            icon?: string;
          }
        | undefined;

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

      return {
        loading: loadingProviders.value || opreturns.get(category) === true,
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
              const registry = JSON.parse(bcmrContent);

              // Validate BCMR registry
              const validRegistry = await validateBcmrSchema(registry);
              if (!validRegistry.success) return;

              // Validate token category
              if (getTokenFromRegister(validRegistry.value, tokenCategory)) {
                opreturns.set(tokenCategory, validRegistry.value);
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
      registryProviders,
      loadingProviders,
      getToken,
      addToken,
      getTokenIdentity,
      getTokenOpreturn,
      getTokenFromRegister,
      opreturnToAuthChain,
    };
  },
  {
    persist: {
      storage: localStorage,
      paths: ["registryList"],
    },
  }
);
