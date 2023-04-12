<template>
  <qr-code
    :contents="content"
    module-color="#1c7d43"
    position-ring-color="#13532d"
    position-center-color="#70c559"
    :style="{
      width: '80px',
      height: '80px',
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
});

onMounted(() => {
  defineCustomElements(window);
});
</script>

<style scoped>
qr-code {
  --code-size: v-bind(size) + "px";
  width: 80px;
  height: 80px;
}
</style>
