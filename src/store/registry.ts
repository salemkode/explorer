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

export const defaultProviders = [
  "https://otr.cash/.well-known/bitcoin-cash-metadata-registry.json",
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
    const registryList = ref([] as RegistryProvider[]);

    const isRegistryProviderExist = (url: string) => {
      return !!registryList.value.find((item) => item.url === url);
    };

    const addRegistryProvider = async (url: string, _default = false) => {
      // Check is url valid using regex
      const urlPattern =
        /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
      if (!urlPattern.test(url)) {
        return {
          status: "Error",
          errorMessage: "Invalid URL",
        } as const;
      }
      const responseRegistry = await fetch(url)
        .then((res) => res.json())
        .catch(() => undefined);

      // Validate BCMR registry
      const registry = await validateBcmrSchema(responseRegistry);
      if (!registry.success) {
        return {
          status: "Error",
          errorMessage: "Invalid BCMR registry schema",
        } as const;
      }

      // Add providers to registryProviders
      if (!isRegistryProviderExist(url)) {
        const registryIdentity = registry.value.registryIdentity;
        // TODO: support auth chain
        const name =
          typeof registryIdentity === "object"
            ? registryIdentity.name
            : registryIdentity;

        if (_default) {
          registryList.value.unshift({
            name,
            url,
            enable: true,
            default: _default,
          });
        } else {
          registryList.value.push({
            name,
            url,
            enable: true,
            default: _default,
          });
        }
      }

      registryProviders.set(url, registry.value);
      return {
        status: "Success",
      } as const;
    };

    onMounted(() => {
      const providerSet = new Set(defaultProviders);
      registryList.value.forEach(({ url }) => providerSet.add(url));

      const promises = Array.from(providerSet, (url) => {
        return addRegistryProvider(url, defaultProviders.includes(url));
      });

      // End loading
      Promise.all(promises).then(() => {
        loadingProviders.value = false;
      });
    });

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
        result.contentHash = binToHex(chunks[1].slice());
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
      const tokenIdentities =
        registry?.identities && registry?.identities[tokenCategory];
      if (tokenIdentities) {
        const timestamp = Object.keys(tokenIdentities)
          .filter((revision) => +new Date(revision) < +new Date())
          .reduce(function (timestamp1, timestamp2) {
            return new Date(timestamp1) > new Date(timestamp2)
              ? timestamp1
              : timestamp2;
          }, "");

        const identity = tokenIdentities[timestamp];
        if (identity && identity.token?.category === tokenCategory) {
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
      registryList,
      addRegistryProvider,
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
