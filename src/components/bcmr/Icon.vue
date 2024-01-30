<template>
  <div class="icon my-1">
    <div ref="reference" class="flex pointer" @click.stop="openPopUp">
      <Image
        :key="iconURL"
        :size="small ? 24 : 80"
        :href="iconURL"
        :failure-href="IdentIcon"
        @success="state.success = true"
      />
    </div>
    <div
      v-if="state.open"
      class="modal-backdrop fade show"
      @click="closePopUp()"
    />
    <Transition name="popup">
      <Image
        v-show="state.open"
        :key="iconURL"
        :href="imageURL"
        :failure-href="iconURL"
        :style="{
          '--x': `${position.x}px`,
          '--y': `${position.y}px`,
          '--image-size': `${small ? 24 : 80}px`,
        }"
        class="popover-image"
        @click="closePopUp()"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { getHttpsUrl, svgToBase64 } from "~/module/utils";
import { createIdenticon } from "~/module/IconGenerator";
import { useRegistryStore } from "~/store";
import type { Capability } from "~/types";

const registryStore = useRegistryStore();
const reference = ref<HTMLElement>();
const props = defineProps<{
  tokenCategory: string;
  commitment?: string;
  capability?: Capability;
  small?: boolean;
}>();

const state = reactive({
  open: false,
  success: false,
});
const resetState = () => {
  state.open = false;
  state.success = false;
};
const tokenInfo = computed(() => {
  // Reset state when tokenInfo changes
  resetState();

  return registryStore.getToken(
    props.tokenCategory,
    props.capability,
    props.commitment
  ).token;
});

const iconURL = computed(() =>
  tokenInfo.value?.icon ? getHttpsUrl(tokenInfo.value?.icon) : ""
);
const imageURL = computed(() =>
  tokenInfo.value?.image ? getHttpsUrl(tokenInfo.value?.image) : ""
);
const IdentIcon = computed(() =>
  svgToBase64(createIdenticon(props.tokenCategory))
);
// TODO: move to custom file
function getElementPosition(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY - window.scrollY,
    left: rect.left + window.scrollX - window.scrollX,
  };
}

const position = reactive({
  x: 0,
  y: 0,
});
const updatePosition = () => {
  // `reference.value` Check if the reference value is not null
  if (reference.value) {
    const { top, left } = getElementPosition(reference.value);
    position.x = left;
    position.y = top;
  }
};
const openPopUp = () => {
  // `state.success` Check if the image is loaded successfully
  if (state.success) {
    updatePosition();
    state.open = true;
  }
};

const closePopUp = () => {
  updatePosition();
  state.open = false;
};
</script>

<style lang="scss" scoped>
.icon > img {
  object-fit: contain;
}

.popover-image {
  position: fixed;
  z-index: 100000;
  width: 70%;
  height: 70%;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
}

.popup-enter-active {
  animation: popup 1s both;
}

.popup-leave-active {
  animation: popup 1s reverse;
}

@keyframes popup {
  0% {
    width: var(--image-size);
    height: var(--image-size);
    top: var(--y, 0);
    left: var(--x, 0);
    transform: translate(0%, 0%);
  }
  100% {
    transform: translate(-50%, -50%);
    width: 70%;
    height: 70%;
    top: 50%;
    left: 50%;
  }
}
</style>
