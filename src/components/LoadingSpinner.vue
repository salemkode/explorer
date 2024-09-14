<template>
  <div class="text-center">
    <div
      class="spinner-grow"
      :class="{
        'spinner-grow-sm': small === true,
      }"
    />
    <p v-if="text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
	text?: string;
	small?: boolean;
}>();
</script>
