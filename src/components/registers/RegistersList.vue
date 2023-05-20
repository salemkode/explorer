<script setup lang="ts">
import { useRegistryStore } from "~/store";

const registryStore = useRegistryStore();
const change = ref(0);
const swapList = ({
  newIndex,
  oldIndex,
}: {
  newIndex: number;
  oldIndex: number;
}) => {
  const [removed] = registryStore.registryList.splice(oldIndex, 1);
  registryStore.registryList.splice(newIndex, 0, removed);
  change.value++;
};
</script>

<template>
  <div v-if="registryStore.registryList.length >= 2">
    <h4 class="my-2">Register order</h4>
    <SortableList
      :key="change"
      :items="registryStore.registryList"
      @sort-end="swapList"
    />
  </div>
</template>
