<template>
  <div class="card text-break">
    <div class="align-items-center d-flex flex-column p-3 flex-md-row">
      <bcmr-icon
        :token-category="category"
        :url="identitySnapshot?.uris?.icon"
      />
      <span class="mx-2" />
      <div>
        <h6 v-text="tokenName" />
        <Copy copy :text="category" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IdentitySnapshot } from "~/types";

const props = defineProps<{
  identitySnapshot?: IdentitySnapshot;
  category: string;
  loading: boolean;
}>();
const tokenName = computed(() =>
  props.loading ? "Loading token name" : props.identitySnapshot?.name
);
</script>
