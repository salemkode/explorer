<template>
  <div class="icon my-1">
    <Transition name="fade" mode="out-in">
      <img
        :key="status.iconUrl"
        :src="status.iconUrl"
        :class="{ small, rounded: props.rounded === true }"
        :width="80"
        :height="80"
        alt="icon"
        @load="status.loaded = true"
        @error="imageLoadError"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { toSvg } from "jdenticon";
import { getHttpsUrl } from "~/module/utils";

const props = defineProps<{
  tokenCategory: string;
  small?: boolean;
  icon?: string;
  rounded?: boolean;
}>();
const status = reactive({
  loaded: false,
  error: false,
  iconUrl: props.icon,
});

watch(
  () => props.icon,
  (url) => {
    if (url) {
      status.loaded = false;
      status.error = false;
      status.iconUrl = getHttpsUrl(url);
    } else {
      imageLoadError();
    }
  },
  {
    immediate: true,
  }
);

function imageLoadError() {
  if (status.error) {
    // Stop for loop error
    return;
  }

  // Change error state
  status.error = true;
  status.loaded = true;
  const svgString = toSvg(props.tokenCategory, 128, {
    lightness: {
      color: [0.39, 0.75],
      grayscale: [0.27, 0.9],
    },
    saturation: {
      color: 0.8,
      grayscale: 0.1,
    },
    padding: 0,
    replaceMode: "observe",
  });
  status.iconUrl = "data:image/svg+xml;base64," + btoa(svgString);
}
</script>

<style scoped>
.icon > img {
  --size-image: 80px;
  object-fit: contain;
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
