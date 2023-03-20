<template>
  <div v-if="tokenData" class="d-flex card p-3">
    <bcmr-icon
      v-if="!!props.hideIcon"
      :token-category="tokenCategory"
      :url="tokenData.uris?.icon"
    />
    <template v-for="(item, index) in tokenInfo" :key="index">
      <span class="text-body-secondary mt-2 mb-1" v-text="item.title" />
      {{ item.text }}
    </template>
    <nuxt-link
      v-if="$route.path !== `/token/${tokenCategory}`"
      class="mt-3 text-decoration-none"
      :to="`/token/${tokenCategory}`"
    >
      Open token page
    </nuxt-link>
  </div>
</template>

<script setup lang="ts">
import { useBcmrStore } from "~/store";
import { formatDateString } from "~/module/utils";

const props = defineProps<{
  tokenCategory: string;
  hideIcon?: boolean;
}>();

const bcmrStore = useBcmrStore();
bcmrStore.addToken(props.tokenCategory);
const tokenData = computed(() => bcmrStore.tokens.get(props.tokenCategory));
const tokenInfo = computed(() => {
  if (!tokenData.value) return [];
  const beginTime = tokenData.value.time.begin;
  const beginTimeStr = beginTime
    ? formatDateString(new Date(beginTime))
    : undefined;
  return [
    {
      title: "Token Name",
      text: tokenData.value?.name,
    },
    {
      title: "Token description",
      text: tokenData.value?.description,
    },
    {
      title: "Token symbol",
      text: tokenData.value?.token?.symbol,
    },
    {
      title: "Begin TimeStamp",
      text: beginTimeStr,
    },
    {
      title: "Decimals",
      text: tokenData.value?.token?.decimals,
    },
  ];
});
</script>
