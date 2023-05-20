<template>
  <h5>Verifying by</h5>
  <div class="d-flex flex-column">
    <div
      v-for="(registry, name) in providers"
      :key="name"
      class="card flex-row px-2 py-1 mb-1 justify-content-between align-items-center"
      :style="{
        order: getOrder(name),
      }"
    >
      <span
        class="select-boll"
        :class="{
          active: name === select,
        }"
      >
        {{ name }}
      </span>
      <div
        v-if="registry === true"
        style="width: 18px; height: 18px"
        class="spinner-grow"
        alt=""
      />
      <i
        v-else-if="registry === false || !isVerified(category, registry)"
        class="uicon-unverified text-danger"
      />
      <i v-else class="uicon-verified text-primary" />
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
const providers = computed(() => {
  const items: Record<string, Registry | boolean> = {
    OpReturn: registryStore.opreturns.get(props.category) || false,
  };

  registryStore.registryProviders.forEach((provider) => {
    if (typeof provider.registryIdentity === "string") {
      items.AuthChain = provider;
      return;
    }

    items[provider.registryIdentity.name] = provider;
  });

  return items;
});

const getOrder = (name: string) => {
  return registryStore.registryList.findIndex(
    (registry) => registry.name === name
  );
};

const isVerified = (category: string, registry: Registry) => {
  const identities = registry.identities;
  const identity = identities && identities[category];
  if (identity) {
    return Object.values(identities[category])?.find(
      (identity) => identity.token?.category
    );
  }
};
</script>

<style scoped>
[class^="uicon-"],
[class*=" uicon-"] {
  font-size: 22px;
}

.select-boll.active::before {
  opacity: 1;
}

.select-boll::before {
  content: "";
  opacity: 0;
  display: inline-block;
  background-color: var(--bs-primary);
  width: 10px;
  height: 10px;
  border-radius: 1000px;
  margin-right: 5px;
}
</style>
