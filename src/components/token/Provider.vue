<template>
  <div class="card p-3">
    <h5>Registry</h5>
    <div class="d-flex flex-column">
      <div
        v-for="{ name, registry, loading, isValidHash } in providers"
        :key="name"
        class="d-flex py-2 align-items-center pointer registry-item"
        @click="selectRegistry(name, registry)"
      >
        <div v-if="loading" class="spinner-grow" alt="" />
        <PopOver
          v-else-if="!registry || !isValidHash"
          :msg="
            !isValidHash ? 'metadata hash matches' : 'not found in registry'
          "
        >
          <i class="uicon-unverified text-danger" />
        </PopOver>
        <i v-else class="uicon-verified text-primary" />
        <span class="px-3 me-auto" v-text="name" />
        <span
          class="select-boll me-1"
          :class="{
            active: name === props.select,
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegistryStore } from "~/store";
import type { Registry } from "~/types";
const registryStore = useRegistryStore();

const props = defineProps<{
  category: string;
  select: string;
}>();
const emit = defineEmits<{
  (e: "select", url: string): void;
}>();

const getRegistryUrl = (name: string) =>
  registryStore.registryList.find((item) => item.name === name)?.url;

const getOrder = (name: string, url?: string) => {
  return registryStore.registryList.findIndex(
    (registry) => registry.name === name || registry.url === url
  );
};

const hasCategory = (registry: Registry, category: string) => {
  if (!registry) {
    return false;
  }

  const identities = registry.identities;
  const identity = identities && identities[category];
  if (identity) {
    return !!Object.values(identities[category])?.find(
      (identity) => identity.token?.category
    );
  }
};

type ProviderItem = {
  name: string;
  registry?: Registry;
  isValidHash?: boolean;
  loading?: boolean;
  url?: string;
};
const providers = computed(() => {
  const authChainProviders = registryStore.authchains.get(props.category);
  const items: ProviderItem[] = [
    {
      name: "AuthChain",
      registry:
        typeof authChainProviders === "object" ? authChainProviders : undefined,
      isValidHash: registryStore.authchainsVerified.get(props.category),
      loading: authChainProviders === true,
    },
  ];

  registryStore.registryProviders.forEach((registryProvider, url) => {
    if (typeof registryProvider.registryIdentity === "string") {
      return;
    }

    items.push({
      name: registryProvider.registryIdentity.name,
      registry: hasCategory(registryProvider, props.category)
        ? registryProvider
        : undefined,
      isValidHash: true,
      loading: registryStore.loadingProviders,
      url,
    });
  });

  return items.sort(
    ({ name: name1, url: url1 }, { name: name2, url: url2 }) =>
      getOrder(name1, url1) - getOrder(name2, url2)
  );
});

const selectRegistry = (name: string, registry?: Registry) => {
  if (typeof registry === "object" && hasCategory(registry, props.category)) {
    emit("select", getRegistryUrl(name) || "");
  }
};
</script>

<style scoped>
[class^="uicon-"],
[class*=" uicon-"] {
  font-size: 22px;
}

.spinner-grow {
  min-height: 18px;
  min-width: 18px;
  width: 18px;
  height: 18px;
}

.select-boll.active {
  opacity: 1;
}

.select-boll {
  background-color: var(--bs-body-color);
  min-width: 10px;
  min-height: 10px;
  border-radius: 1000px;
  transition: opacity 0.5s;
  opacity: 0;
}
</style>
