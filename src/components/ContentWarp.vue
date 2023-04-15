<template>
  <div class="card p-3">
    <LoadingSpinner v-if="props.loading" />
    <template v-else-if="existItems.length">
      <slot name="header"></slot>
      <template v-for="(item, index) in existItems" :key="index">
        <div v-if="!loading && item.text">
          <div class="text-body-secondary mb-1" v-text="item.title" />
          <Copy
            :url="item.url"
            :text="item.text"
            :copy="!!item.copy"
            :warp="item.warp"
          />
          <div v-if="existItems.length !== index + 1" class="mb-2" />
        </div>
      </template>
      <slot name="footer"></slot>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { contentWarp } from "@/types";
const props = defineProps({
  items: {
    type: Array as PropType<contentWarp[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const existItems = computed(() => {
  return props.items.filter((item) => item.text);
});
</script>
