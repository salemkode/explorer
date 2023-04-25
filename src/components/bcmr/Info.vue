<template>
  <content-warp v-if="tokenInfo.length" :loading="loading" :items="tokenInfo">
    <template #header>
      <bcmr-icon
        v-if="props.tokenCategory"
        :token-category="props.tokenCategory"
        :url="props.identitySnapshot?.uris?.icon"
        class="mb-2"
      />
    </template>
    <template #footer>
      <div v-if="tokenCategory" class="btn p-0 mt-3 text-start">
        <nuxt-link
          class="nav-link text-decoration-none text-bold"
          :to="`/token/${tokenCategory}`"
        >
          Open token page
        </nuxt-link>
      </div>
    </template>
  </content-warp>
</template>

<script setup lang="ts">
import type { IdentitySnapshot, contentWarpItem } from "~/types";

const props = defineProps<{
  identitySnapshot?: IdentitySnapshot;
  tokenCategory?: string;
  loading: boolean;
}>();

const tokenInfo = computed<contentWarpItem[]>(() => {
  if (!props.identitySnapshot) return [];
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
      title: "Decimals",
      text: props.identitySnapshot?.token?.decimals,
    },
  ];
});
</script>
