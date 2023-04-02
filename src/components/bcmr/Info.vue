<template>
  <ContentWarp v-if="tokenInfo.length" :loading="loading" :items="tokenInfo">
    <template #header>
      <bcmr-icon
        v-if="props.tokenCategory"
        :token-category="props.tokenCategory"
        :url="props.identitySnapshot?.uris?.icon"
        class="mb-2"
      />
    </template>
    <template #footer>
      <div v-if="tokenCategory" class="btn btn-success mt-3">
        <nuxt-link
          class="nav-link text-decoration-none"
          :to="`/token/${tokenCategory}`"
        >
          Open token page
        </nuxt-link>
      </div>
    </template>
  </ContentWarp>
</template>

<script setup lang="ts">
import { formatDateString } from "~/module/utils";
import { IdentitySnapshot } from "~/types";

const props = defineProps<{
  identitySnapshot?: IdentitySnapshot;
  tokenCategory?: string;
  loading: boolean;
}>();

const tokenInfo = computed(() => {
  if (!props.identitySnapshot) return [];
  const beginTime = props.identitySnapshot.time.begin;
  const beginTimeStr = beginTime
    ? formatDateString(new Date(beginTime))
    : undefined;
  return [
    {
      title: "Token Name",
      text: props.identitySnapshot?.name,
    },
    {
      title: "Token description",
      text: props.identitySnapshot?.description,
    },
    {
      title: "Token symbol",
      text: props.identitySnapshot?.token?.symbol,
    },
    {
      title: "Begin TimeStamp",
      text: beginTimeStr,
    },
    {
      title: "Decimals",
      text: props.identitySnapshot?.token?.decimals,
    },
  ];
});
</script>
