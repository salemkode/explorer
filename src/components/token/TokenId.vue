<template>
  <div class="card text-break">
    <div class="d-flex flex-column align-items-md-center p-3 flex-md-row">
      <bcmr-icon :token-category="category" />
      <span class="mx-2" />
      <div>
        <h6 v-text="tokenName" />
        <BaseCopy :text="category" class="align-items-center" copy />
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
const tokenName = computed(() => {
  const name = props.identitySnapshot?.name;
  return !name && props.loading ? "Loading" : name;
});
</script>
