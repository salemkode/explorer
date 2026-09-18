<template>
  <td class="px-5 py-3.5 text-sm text-slate-700 dark:text-zinc-300 align-middle whitespace-nowrap">
    <div class="flex items-center gap-2">
      <bcmr-icon
        v-if="column.token"
        :token-category="column.token.category"
        :commitment="column.token.commitment"
        :capability="column.token.capability"
        small
        class="shrink-0"
      />

      <!-- Copyable value of item -->
      <BaseCopy
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
