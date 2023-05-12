<script setup lang="ts">
import { useRegistryStore } from "~/store";

const registryStore = useRegistryStore();
const swapList = ({
  newIndex,
  oldIndex,
}: {
  newIndex: number;
  oldIndex: number;
}) => {
  const temp = registryStore.registryList[newIndex];
  registryStore.registryList[newIndex] = registryStore.registryList[oldIndex];
  registryStore.registryList[oldIndex] = temp;
};
</script>

<template>
  <div v-if="registryStore.registryList.length >= 2">
    <h4 class="my-2">Register order</h4>
    <SortableList :items="registryStore.registryList" @sort-end="swapList" />
  </div>
</template>
