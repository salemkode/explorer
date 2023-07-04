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

const removeItem = (index: number) => {
  const url = registryStore.registryList.at(index)?.url;

  if (index === -1 || !url) return;

  registryStore.registryList.splice(index, 1);
  registryStore.registryProviders.delete(url);
};
</script>

<template>
  <div v-if="registryStore.registryList.length >= 2" class="card p-3">
    <h4 class="pt-2 pb-3">Register order</h4>
    <SortableList :key="change" @sort-end="swapList">
      <div
        v-for="(item, index) in registryStore.registryList"
        :key="index"
        class="d-flex p-2 mb-2"
      >
        <i class="uicon-draggable" style="cursor: grab" />
        <span class="me-auto px-3" v-text="item.name" />
        <i
          v-show="!registryStore.registryList.at(index)?.default"
          class="uicon-trash text-danger pointer"
          @click="removeItem(index)"
        />
      </div>
    </SortableList>
  </div>
</template>
