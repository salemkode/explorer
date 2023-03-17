<template>
  <div class="container">
    <div class="block-info">
      <span v-text="$t('block')" />
      {{ route.params.slug }}
    </div>
    {{ data }}
  </div>
</template>

<script setup lang="ts">
import { GetBlock, GetBlockQuery } from "~/module/chaingraph";
import { useSettingStore } from "~~/src/store";
const settingStore = useSettingStore();

const route = useRoute();
const variables = computed(() => ({
  hash: route.params.slug,
  height: route.params.slug,
  network: settingStore.network,
}));
const { data } = useAsyncQuery<GetBlockQuery>(GetBlock, variables);
</script>
