<script setup lang="ts">
import { useRegistryStore } from "~/store";

const registryStore = useRegistryStore();

const getOrder = (url: string) => {
	return registryStore.registryList.findIndex((v) => v.url === url);
};
</script>

<template>
  <div class="container">
    <div class="page d-flex d-lg-grid">
      <div class="column">
        <RegistersAddCard />
        <RegistersList />
      </div>
      <div class="column">
        <div class="d-grid h-max-content gap-3">
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
        <LoadingSpinner v-if="registryStore.loadingProviders" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  flex-direction: column;
  grid-template-columns: 1fr 2.5fr;
  gap: 15px;
}
.page .column {
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow-x: hidden;
}
.page .column > * {
  margin-top: 10px;
}
</style>
