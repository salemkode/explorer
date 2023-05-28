import { utf8ToBin, binToHex, sha256 } from "@bitauth/libauth";
import { defineStore } from "pinia";
import { opreturnToAuthChainElement } from "~/module/bitcoin";
import { validateBcmrSchema } from "~/module/utils";
import type { Registry, RegistryProvider, tokenCapability } from "~/types";

export const defaultProviders = [
  "https://otr.cash/.well-known/bitcoin-cash-metadata-registry.json",
  `${location.origin}/registry.json`,
  "auth_chain",
];
export const useRegistryStore = defineStore(
  "registry",
  () => {
    const authchains = shallowReactive(new Map<string, Registry | boolean>());
    const authchainsVerified = shallowReactive(new Map<string, boolean>());
    const registryProviders = shallowReactive(new Map<string, Registry>());

    const loadingProviders = ref(true);
    const registryList = ref([] as RegistryProvider[]);
    const isRegistryProviderExist = (url: string) => {
      return !!registryList.value.find((item) => item.url === url);
    };

    const addRegistryProvider = async (url: string, _default = false) => {
      if (url === "auth_chain") {
        return {
          status: "Success",
        } as const;
      }

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
      // Remove default providers when removed from defaultProviders
      registryList.value.forEach((registry, index) => {
        if (registry.default && !defaultProviders.includes(registry.url)) {
          registryList.value.splice(index, 1);
        }
      });

      // Add authChain to registryList
      !registryList.value.find(({ url }) => url === "auth_chain") &&
        registryList.value.unshift({
          name: "AuthChain",
          default: true,
          enable: true,
          url: "auth_chain",
        });

      // Add default providers
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
      const opreturnResult = authchains.get(category);
      // for in array
      for (let i = 0; i < registryList.value.length; i++) {
        const { url } = registryList.value[i];
        const registry =
          url === "auth_chain" ? opreturnResult : registryProviders.get(url);

        if (
          typeof registry === "object" &&
          registry.identities &&
          registry.identities[category]
        ) {
          return registry;
        }
      }
    };

    const getTokenIdentity = (category: string, registryUrl?: string) => {
      const registryFromUrl = (() => {
        if (!registryUrl) return;
        if (registryUrl === "auth_chain") return authchains.get(category);
        if (registryUrl) return registryProviders.get(registryUrl);
      })();
      const registry =
        typeof registryFromUrl === "object"
          ? registryFromUrl
          : getRegistryHasCategory(category);

      if (registry) {
        const identity = getTokenFromRegister(registry, category);
        if (identity) {
          const registryName =
            typeof registry.registryIdentity === "object" &&
            registry.registryIdentity.name;

          return {
            name:
              registryUrl === "auth_chain" ? "AuthChain" : registryName || "",
            identity,
          };
        }
      }

      return {
        name: registryList.value.find(({ url }) => url === registryUrl)?.name,
      };
    };

    const getToken = (
      category: string,
      nftType?: tokenCapability,
      nftCommitment?: string
    ) => {
      const tokenIdentity = getTokenIdentity(category);
      let token:
        | {
            name: string;
            description?: string;
            symbol?: string;
            icon?: string;
            decimals: number;
          }
        | undefined;

      if (tokenIdentity && tokenIdentity.identity) {
        const { identity } = tokenIdentity;
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
              decimals: 0,
            };
          }
        } else {
          token = {
            name: identity.name,
            description: identity.description,
            symbol: identity.token?.symbol,
            icon: identity.uris ? identity.uris["icon"] : undefined,
            decimals: identity.token?.decimals || 0,
          };
        }
      }

      return {
        loading: loadingProviders.value || authchains.get(category) === true,
        token,
      };
    };

    const decodeOpreturn = async (
      tokenCategory: string,
      opReturnHex: string
    ) => {
      // Check is opReturnHex is valid BCMR OP_RETURN
      const authChainElement = opreturnToAuthChainElement(opReturnHex);
      if (typeof authChainElement === "string") return;

      const response = await fetch(authChainElement.url);
      if (response.status === 200) {
        const bcmrContent = await response.text();
        const hashContent = binToHex(sha256.hash(utf8ToBin(bcmrContent)));
        try {
          // Parse BCMR registry
          const registry = JSON.parse(bcmrContent);

          // Validate BCMR registry schema
          const validRegistry = await validateBcmrSchema(registry);
          if (!validRegistry.success) return;

          // Validate token category
          if (getTokenFromRegister(validRegistry.value, tokenCategory)) {
            return {
              registry: validRegistry.value,
              verified: hashContent === authChainElement.contentHash,
            };
          }
        } catch (error) {
          console.log("Parsing error: ", error);
        }
      }
    };

    const addToken = (tokenCategory: string, opReturnHex: string) => {
      if (!tokenCategory || !opReturnHex) return;
      // Check is token already added
      if (authchains.get(tokenCategory) !== undefined) {
        return;
      }

      authchains.set(tokenCategory, true);
      decodeOpreturn(tokenCategory, opReturnHex)
        .then((result) => {
          if (result) {
            authchains.set(tokenCategory, result.registry);
            authchainsVerified.set(tokenCategory, result.verified);
          } else {
            authchains.set(tokenCategory, false);
          }
        })
        .catch(() => authchains.set(tokenCategory, false));
    };

    const getTokenOpreturn = (tokenCategory: string, opReturnHex: string) => {
      const result = computed(() => {
        const registry = authchains.get(tokenCategory);
        if (registry === true) {
          return {
            verified: false,
            loading: true,
            identity: undefined,
          };
        } else {
          return {
            verified: !!authchainsVerified.get(tokenCategory),
            loading: false,
            identity: registry
              ? getTokenFromRegister(registry, tokenCategory)
              : undefined,
          };
        }
      });
      if (authchains.get(tokenCategory) !== undefined) {
        return result;
      }
      addToken(tokenCategory, opReturnHex);
      return result;
    };

    return {
      authchains,
      authchainsVerified,
      registryProviders,
      loadingProviders,
      registryList,
      addRegistryProvider,
      getToken,
      addToken,
      getTokenIdentity,
      getTokenOpreturn,
      getTokenFromRegister,
    };
  },
  {
    persist: {
      storage: localStorage,
      paths: ["registryList"],
    },
  }
);
