<template>
  <content-warp v-if="loading || tokenInfo.length" :loading="loading" :items="tokenInfo">
    <template #header>
      <bcmr-icon
        v-if="props.tokenCategory && props.identitySnapshot?.uris?.icon"
        :token-category="props.tokenCategory"
        :identity-snapshot="props.identitySnapshot || null"
        class="mb-3"
      />
    </template>
  </content-warp>
</template>

<script setup lang="ts">
import type { contentWarpItem, IdentitySnapshot } from "~/types";

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
