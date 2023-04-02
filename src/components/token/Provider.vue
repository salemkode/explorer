<template>
  <h5>Verifying by</h5>
  <ul class="list-group">
    <li v-for="(registry, name) in providers" :key="name" :class="itemClass">
      {{ name }}
      <div
        v-if="registry === true"
        style="width: 18px; height: 18px"
        class="spinner-grow text-success"
        alt=""
      />
      <img
        v-else-if="registry === false || !isVerified(category, registry)"
        width="18"
        src="~/assets/icons/unverified.svg"
        alt=""
      />
      <img v-else width="18" src="~/assets/icons/verified.svg" alt="" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useBcmrStore } from "~/store";
import { Registry } from "~/types";
const bcmrStore = useBcmrStore();

const props = defineProps<{
  category: string;
}>();
const providers = computed(() => {
  const providersObj = Object.fromEntries(bcmrStore.providers);
  return {
    OpReturn: bcmrStore.opreturns.get(props.category) || false,
    ...providersObj,
  };
});

const itemClass =
  "list-group-item d-flex justify-content-between align-items-center";
const isVerified = (category: string, registry: Registry) => {
  const identities = registry.identities;
  return identities
    ? !!identities[category]?.find((identity) => identity.token?.category)
    : false;
};
</script>
