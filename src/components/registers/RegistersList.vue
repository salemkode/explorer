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
  <div v-if="registryStore.registryList.length >= 2" class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs transition-colors">
    <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-3">
      Registry Priority Order
    </h3>
    <SortableList :key="change" @sort-end="swapList">
      <div
        v-for="(item, index) in registryStore.registryList"
        :key="index"
        class="flex items-center gap-3 p-2.5 mb-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 hover:border-emerald-500/30 transition-colors select-none"
      >
        <i class="uicon-draggable text-slate-400 dark:text-zinc-500 cursor-grab active:cursor-grabbing text-sm" />
        <span class="flex-1 truncate" v-text="item.name" />
        <button
          v-show="!registryStore.registryList.at(index)?.default"
          type="button"
          class="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
          aria-label="Remove registry"
          @click="removeItem(index)"
        >
          <i class="uicon-trash text-xs" />
        </button>
      </div>
    </SortableList>
  </div>
</template>
