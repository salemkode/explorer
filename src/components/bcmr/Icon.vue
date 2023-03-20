<template>
  <div class="icon my-1">
    <div v-if="!status.loaded" class="spinner-grow" role="status">
      <span class="sr-only">Loading...</span>
    </div>
    <img
      v-show="status.loaded"
      :src="status.iconUrl"
      @load="status.loaded = true"
      @error="imageLoadError"
    />
  </div>
</template>

<script setup lang="ts">
import { toSvg } from "jdenticon";

const props = defineProps<{
  tokenCategory: string;
  url?: string;
}>();
const status = reactive({
  loaded: true,
  error: false,
  iconUrl: props.url,
});

if (!props.url) {
  status.loaded = true;
  imageLoadError();
}
//
function imageLoadError() {
  if (status.error) {
    // Stop for loop error
    return;
  }

  // Change error state
  status.error = true;

  // Create svg icon for token
  const svgString = toSvg(props.tokenCategory, 128);
  status.iconUrl = "data:image/svg+xml;base64," + btoa(svgString);
  status.loaded = true;
}
</script>

<style scoped>
.icon > * {
  max-width: 80px;
  max-height: 80px;
}

.icon .loading {
  border-radius: 5px;
  background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.5) 50%,
      rgba(255, 255, 255, 0) 80%
    ),
    lightgray;
  background-repeat: repeat-y;
  background-size: 50px 500px;
  background-position: -50% 0;
  animation: shine 2s infinite linear alternate;
}

@keyframes shine {
  to {
    background-position: 150% 0;
  }
}
</style>
