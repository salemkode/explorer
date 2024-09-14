<template>
  <td>
    <div class="d-flex align-items-center">
      <bcmr-icon
        v-if="column.token"
        :token-category="column.token.category"
        :commitment="column.token.commitment"
        :capability="column.token.capability"
        small
        class="icon mb-2 me-2"
      />

      <!-- Copyable value of item -->
      <BaseCopy
        class="d-flex align-items-center"
        :short="column.short"
        :text="column.text"
        :copy="!!column.copy"
        :url="column.url"
      />
    </div>
  </td>
</template>

<script setup lang="ts">
import type { tableColumn } from "~/types/index.js";

defineProps<{
	column: tableColumn;
}>();
</script>

<style scoped>
pre {
  margin: 0;
}
td {
  vertical-align: middle;
}
</style>
