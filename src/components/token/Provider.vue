<template>
  <div class="card p-3">
    <h5>Registry</h5>
    <div class="d-flex flex-column">
      <div
        v-for="[name, registry] in providers"
        :key="name"
        class="d-flex py-2 align-items-center pointer registry-item"
        @click="selectRegistry(registry, name)"
      >
        <div v-if="registry === true" class="spinner-grow" alt="" />
        <i
          v-else-if="registry === false || !isVerified(category, registry)"
          class="uicon-unverified text-danger"
        />
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

const getOrder = (name: string) => {
  return registryStore.registryList.findIndex(
    (registry) => registry.name === name
  );
};

const providers = computed(() => {
  const items: [string, Registry | boolean][] = [
    ["OpReturn", registryStore.opreturns.get(props.category) || false],
  ];

  registryStore.registryProviders.forEach((provider) => {
    if (typeof provider.registryIdentity === "string") {
      return;
    }

    items.push([provider.registryIdentity.name, provider]);
  });

  return items.sort(([name1], [name2]) => getOrder(name1) - getOrder(name2));
});

const isVerified = (category: string, registry: Registry) => {
  const identities = registry.identities;
  const identity = identities && identities[category];
  if (identity) {
    return Object.values(identities[category])?.find(
      (identity) => identity.token?.category
    );
  }
};

const selectRegistry = (registry: Registry | boolean, name: string) => {
  if (typeof registry === "object" && !isVerified(props.category, registry)) {
    return;
  }
  emit("select", getRegistryUrl(name) || "");
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
