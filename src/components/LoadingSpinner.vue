<template>
  <div class="text-center">
    <div class="spinner-grow" />
    <p v-if="text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string;
}>();
</script>
