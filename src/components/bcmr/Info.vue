<template>
  <div class="card p-3">
    <LoadingVue v-if="loading" />
    <template v-else-if="bcmrTokenData">
      <bcmr-icon
        v-if="!!props.hideIcon"
        :token-category="tokenCategory"
        :url="bcmrTokenData.uris?.icon"
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { useBcmrStore } from "~/store";
import { formatDateString } from "~/module/utils";

const props = defineProps<{
  tokenCategory: string;
  hideIcon?: boolean;
}>();

const { result: bcmrTokenData, loading } = useBcmrStore().getTokenInfo(
  props.tokenCategory
);
const tokenInfo = computed(() => {
  if (!bcmrTokenData.value) return [];
  const beginTime = bcmrTokenData.value.time.begin;
  const beginTimeStr = beginTime
    ? formatDateString(new Date(beginTime))
    : undefined;
  return [
    {
      title: "Token Name",
      text: bcmrTokenData.value?.name,
    },
    {
      title: "Token description",
      text: bcmrTokenData.value?.description,
    },
    {
      title: "Token symbol",
      text: bcmrTokenData.value?.token?.symbol,
    },
    {
      title: "Begin TimeStamp",
      text: beginTimeStr,
    },
    {
      title: "Decimals",
      text: bcmrTokenData.value?.token?.decimals,
    },
  ];
});
</script>
