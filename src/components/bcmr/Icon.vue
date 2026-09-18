<template>
  <div class="inline-flex items-center my-0.5">
    <div ref="reference" class="inline-flex items-center cursor-pointer" @click.stop="openPopUp">
      <Image
        :key="iconURL"
        :size="imageSize"
        :href="iconURL"
        :failure-href="IdentIcon"
        class="rounded-lg object-contain"
        @success="state.success = true"
      />
    </div>

    <Teleport to="body">
      <div
        v-if="state.open"
        class="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs transition-opacity"
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
            '--image-size': `${imageSize}px`,
          }"
          class="popover-image rounded-2xl shadow-2xl z-50 object-contain p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
          @click="closePopUp()"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { createIdenticon } from "~/module/IconGenerator";
import { getHttpsUrl, svgToBase64 } from "~/module/utils";
import { useRegistryStore } from "~/store";
import type { Capability } from "~/types";

const registryStore = useRegistryStore();
const reference = ref<HTMLElement>();
const props = defineProps<{
	tokenCategory: string;
	commitment?: string;
	capability?: Capability;
	small?: boolean;
	size?: number;
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
	resetState();

	return registryStore.getToken(
		props.tokenCategory,
		props.capability,
		props.commitment,
	).token;
});

const iconURL = computed(() =>
	tokenInfo.value?.icon ? getHttpsUrl(tokenInfo.value?.icon) : "",
);
const imageURL = computed(() =>
	tokenInfo.value?.image ? getHttpsUrl(tokenInfo.value?.image) : "",
);
const imageSize = computed(() => props.size || (props.small ? 24 : 80));
const IdentIcon = computed(() =>
	svgToBase64(createIdenticon(props.tokenCategory)),
);

function getElementPosition(element: HTMLElement) {
	const rect = element.getBoundingClientRect();
	return {
		top: rect.top,
		left: rect.left,
	};
}

const position = reactive({
	x: 0,
	y: 0,
});
const updatePosition = () => {
	if (reference.value) {
		const { top, left } = getElementPosition(reference.value);
		position.x = left;
		position.y = top;
	}
};
const openPopUp = () => {
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

<style scoped>
.popover-image {
  position: fixed;
  z-index: 100000;
  max-width: 80vw;
  max-height: 80vh;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
}

.popup-enter-active {
  animation: popup 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.popup-leave-active {
  animation: popup 0.2s ease-in reverse;
}

@keyframes popup {
  0% {
    width: var(--image-size);
    height: var(--image-size);
    top: var(--y, 0);
    left: var(--x, 0);
    transform: translate(0%, 0%);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%);
    width: min(400px, 80vw);
    height: min(400px, 80vh);
    top: 50%;
    left: 50%;
    opacity: 1;
  }
}
</style>
