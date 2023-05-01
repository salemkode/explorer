<template>
  <h5>Verifying by</h5>
  <ul class="list-group">
    <li v-for="(registry, name) in providers" :key="name" :class="itemClass">
      {{ name }}
      <div
        v-if="registry === true"
        style="width: 18px; height: 18px"
        class="spinner-grow"
        alt=""
      />
      <i
        v-else-if="registry === false || !isVerified(category, registry)"
        class="uicon-unverified"
      />
      <i v-else class="uicon-verified" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useRegistryStore } from "~/store";
import type { Registry } from "~/types";
const registryStore = useRegistryStore();

const props = defineProps<{
  category: string;
}>();
const providers = computed(() => {
  const providersObj = Object.fromEntries(registryStore.registryProviders);
  return {
    OpReturn: registryStore.opreturns.get(props.category) || false,
    ...providersObj,
  };
});

const itemClass =
  "list-group-item d-flex justify-content-between align-items-center";
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
