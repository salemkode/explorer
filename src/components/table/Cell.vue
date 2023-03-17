<template>
  <td>
    <Copy
      v-if="typeof column === 'object'"
      class="d-flex align-items-center word-brack-all"
      :short="column.short"
      :text="column.text"
      :copy="!!column.copy"
      :url="column.url"
    />
    <!-- Empty value of item -->
    <pre v-else-if="column === ''" v-text="' '" />
    <span v-else>
      {{ column }}
    </span>
  </td>
</template>

<script setup lang="ts">
import { tableColumn } from "~/types/table";

defineProps<{
  column: tableColumn;
}>();
</script>

<style scoped>
pre {
  margin: 0;
}
</style>
