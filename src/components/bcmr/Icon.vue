<template>
  <div class="icon my-1">
    <Transition name="fade" mode="out-in">
      <img
        :key="status.iconUrl"
        :src="status.iconUrl"
        :class="{ small }"
        alt="icon"
        @load="status.loaded = true"
        @error="imageLoadError"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { toSvg } from "jdenticon";

const props = defineProps<{
  tokenCategory: string;
  small?: boolean;
  url?: string;
}>();
const status = reactive({
  loaded: true,
  error: false,
  iconUrl: props.url,
});

watch(
  () => props.url,
  (url) => {
    if (url) {
      status.loaded = false;
      status.error = false;
      status.iconUrl = url;
    } else {
      imageLoadError();
    }
  }
);
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
.icon > img {
  --size-image: 80px;
  width: var(--size-image);
  max-width: var(--size-image);
  max-height: var(--size-image);
}

.icon > img.small {
  --size-image: 24px;
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
