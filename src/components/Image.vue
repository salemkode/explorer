<template>
  <Transition name="fade" mode="out-in">
    <img
      ref="reference"
      :key="state.href"
      :src="state.href"
      :width="props.size"
      :height="props.size"
      v-bind="props"
      @load="handleImageLoaded"
      @error="imageLoadError"
    />
  </Transition>
</template>

<script setup lang="ts">
const emit = defineEmits(["success"]);
interface ImageComponentProps {
	size?: number;
	href: string;
	failureHref: string;
}
const props = defineProps<ImageComponentProps>();
const state = reactive({
	error: false,
	href: props.href,
});

const reset = () => {
	state.error = false;
	state.href = props.href;
};
watch(toRef(props, "href"), (url) => {
	if (url) {
		reset();
	} else {
		imageLoadError();
	}
});

function imageLoadError() {
	if (state.error) {
		// Stop for loop error
		return;
	}

	// Change error state
	state.error = true;
	state.href = props.failureHref;
}

const handleImageLoaded = () => {
	// If image load without error, emit success
	if (!state.error) {
		emit("success");
	}
};
</script>

<style lang="scss" scoped>
img {
  object-fit: contain;
}
</style>
