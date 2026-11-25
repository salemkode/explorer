<script setup lang="ts">
import { useRegistryStore } from "~/store";

const registryStore = useRegistryStore();

const getOrder = (url: string) => {
	return registryStore.registryList.findIndex((v) => v.url === url);
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Add Registry & Priority Order -->
      <div class="lg:col-span-4 space-y-6">
        <RegistersAddCard />
        <RegistersList />
      </div>

      <!-- Right Column: Registry Providers List -->
      <div class="lg:col-span-8 space-y-4">
        <div class="flex flex-col gap-4">
          <RegistersItem
            v-for="[url, registry] in registryStore.registryProviders"
            :key="url"
            :registry="registry"
            :url="url"
            :style="{
              order: getOrder(url),
            }"
          />
        </div>
        <div v-if="registryStore.loadingProviders" role="status" aria-busy="true" class="mt-4 space-y-3">
          <span class="sr-only">Loading</span>
          <Skeleton class="h-16 w-full rounded-2xl" />
          <Skeleton class="h-16 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
</template>
