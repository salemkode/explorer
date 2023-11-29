<template>
  <qr-code
    :key="content"
    :contents="content"
    module-color="#1c7d43"
    position-ring-color="#13532d"
    position-center-color="#70c559"
    :style="{
      '--code-size': `${size}px`,
      '--scale-size': scale ? '2' : '1',
    }"
  />
</template>

<script setup lang="ts">
import { defineCustomElements } from "@bitjson/qr-code";

defineProps({
  size: {
    type: Number,
    default: 80,
  },
  content: {
    type: String,
    required: true,
  },
  scale: {
    type: Boolean,
    default: false,
  },
});

onMounted(() => {
  defineCustomElements(window);
});
</script>

<style scoped>
qr-code {
  width: var(--code-size);
  height: var(--code-size);
  background: white;
  border-radius: 10px;
  transform: scale(var(--scale-size));
  transform-origin: 0 0;
  transition: transform 1s;
  aspect-ratio: 1/1;
}
</style>
