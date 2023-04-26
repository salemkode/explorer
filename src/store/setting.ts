import { defineStore } from "pinia";
import { validateBcmrSchema } from "~/module/utils";
import type { RegistryProviders } from "~/types";
import { useRegistryStore } from "./";

export const useSettingStore = defineStore("setting", () => {
  const registryStore = useRegistryStore();
  const registryList = reactive([] as RegistryProviders[]);

  // TODO: remove validation from url if you will validate it before
  const addRegistryProvider = async (name: string, url: string) => {
    // Check is registry already exists
    const existItem = registryList.find(
      (item) => item.name === name || item.url === url
    );
    if (existItem) {
      return {
        error: "Already exists",
      };
    }

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

    registryList.push({ name, url, enabled: true });

    // Add providers to registryProviders
    registryStore.registryProviders.set(name, registry.value);

    return "Success";
  };

  onMounted(() => {
    const promises = registryList.map((item) =>
      addRegistryProvider(item.name, item.url)
    );

    // End loading
    Promise.all(promises).then(() => {
      registryStore.loadingProviders = false;
    });
  });

  return {
    addRegistryProvider,
    registryList,
  };
});
