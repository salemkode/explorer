<template>
  <div class="icon my-1">
    <Transition name="fade" mode="out-in">
      <img
        ref="reference"
        :key="state.iconUrl"
        :src="state.iconUrl"
        :class="{ small, rounded: props.rounded === true }"
        :width="80"
        :height="80"
        alt="icon"
        class="rounded pointer"
        @load="state.loaded = true"
        @error="imageLoadError"
        @click.stop="imageClick"
      />
    </Transition>
    <div
      v-if="!state.error && state.open"
      class="modal-backdrop fade show"
      @click.stop="state.open && imageClick()"
    />
    <img
      v-if="!state.error"
      :key="state.iconUrl"
      :src="state.iconUrl"
      :class="{ small, rounded: props.rounded === true, open: state.open }"
      :style="{
        top: `${state.y}px`,
        left: `${state.x}px`,
        transition: state.transition,
      }"
      class="popover-image rounded pointer"
      alt="icon"
      @click.stop="state.open && imageClick()"
    />
  </div>
</template>

<script setup lang="ts">
import { toSvg } from "jdenticon";
import { getHttpsUrl } from "~/module/utils";

const reference = ref<HTMLElement>();
const props = defineProps<{
  tokenCategory: string;
  small?: boolean;
  icon?: string;
  rounded?: boolean;
}>();
const state = reactive({
  loaded: false,
  error: false,
  iconUrl: props.icon,
  open: false,
  x: 0,
  y: 0,
  transition: "",
});

watch(
  () => props.icon,
  (url) => {
    if (url) {
      state.loaded = false;
      state.error = false;
      state.iconUrl = getHttpsUrl(url);
    } else {
      imageLoadError();
    }
  },
  {
    immediate: true,
  }
);

function imageLoadError() {
  if (state.error) {
    // Stop for loop error
    return;
  }

  // Change error state
  state.error = true;
  state.loaded = true;
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
  state.iconUrl = "data:image/svg+xml;base64," + btoa(svgString);
}

//
function getElementPosition(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.pageYOffset - window.scrollY,
    left: rect.left + window.pageXOffset - window.scrollX,
  };
}

const imageClick = async () => {
  if (!reference.value) return;
  !state.open && (state.transition = "");
  await nextTick();
  const { top, left } = getElementPosition(reference.value);
  state.y = top;
  state.x = left;

  setTimeout(async () => {
    await nextTick();
    state.transition = "all 0.8s ease-in-out";
    state.open = !state.open;
  });
};
</script>

<style lang="scss" scoped>
.icon > img {
  --size-image: 80px;
  object-fit: contain;
  width: var(--size-image);
  height: var(--size-image);

  &.popover-image {
    position: fixed;
    left: 50%;
    top: 50%;
    z-index: 100000;
    width: 0;
    height: 0;
    opacity: 0;

    &.open {
      width: 70%;
      height: 70%;
      transform: translate(-50%, -50%);
      top: 50% !important;
      left: 50% !important;
      opacity: 1;
    }
  }
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
