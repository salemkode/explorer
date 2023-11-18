<template>
  <div class="icon my-1">
    <div ref="reference" class="flex pointer" @click.stop="openPopUp">
      <Image
        :key="state.href"
        :size="small ? 24 : 80"
        :href="iconURL"
        :failure-href="IdentIcon"
        @success="state.success = true"
      />
    </div>
    <div
      v-if="state.open"
      class="modal-backdrop fade show"
      @click.stop="closePopUp()"
    />
    <Transition name="popup">
      <img
        v-show="state.open"
        :key="iconURL"
        :src="iconURL"
        :style="{
          '--x': `${state.x}px`,
          '--y': `${state.y}px`,
          '--image-size': `${small ? 24 : 80}px`,
        }"
        class="popover-image pointer"
        alt="icon"
        @click.stop="closePopUp()"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
// TODO: add reset when icon change
import { svgToBase64, getHttpsUrl } from "~/module/utils";
import { createIdenticon } from "~/module/IconGenerator";

const reference = ref<HTMLElement>();
const props = defineProps<{
  tokenCategory: string;
  small?: boolean;
  icon?: string;
}>();
const state = reactive({
  href: props.icon,
  open: false,
  success: false,
  x: 0,
  y: 0,
});

const iconURL = computed(() => (props.icon ? getHttpsUrl(props.icon) : ""));
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

const openPopUp = () => {
  // `reference.value` Check if the reference value is not null
  // `state.success` Check if the image is loaded successfully
  if (reference.value && state.success) {
    const { top, left } = getElementPosition(reference.value);
    state.y = top;
    state.x = left;
    state.open = true;
  }
};

const closePopUp = () => {
  state.open = false;
};
</script>

<style lang="scss" scoped>
.icon > img {
  object-fit: contain;

  &.popover-image {
    position: fixed;
    z-index: 100000;
    width: 70%;
    height: 70%;
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
  }
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
