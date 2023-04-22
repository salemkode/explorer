<template>
  <div class="container">
    <div class="block-info">
      <span v-text="$t('block')" />
      {{ route.params.slug }}
    </div>
    {{ data }}

    Soon Page
  </div>
</template>

<script setup lang="ts">
import { GetBlock, type GetBlockQuery } from "~/module/chaingraph";
import { useAppStore } from "~/store";
const appStore = useAppStore();

const route = useRoute();
const variables = computed(() => ({
  hash: route.params.slug,
  height: route.params.slug,
  network: appStore.network,
}));
const { data } = useAsyncQuery<GetBlockQuery>(GetBlock, variables);
</script>
