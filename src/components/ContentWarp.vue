<template>
  <div class="card p-3 tx-info">
    <template v-for="(item, index) in items" :key="index">
      <div v-if="item.text">
        <div class="text-body-secondary mt-2 mb-1" v-text="item.title" />
        <Copy :text="item.text" :copy="!!item.copy" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { contentWarp } from "@/types";
defineProps<{
  items: contentWarp[];
}>();
</script>
