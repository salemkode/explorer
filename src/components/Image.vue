<template>
  <span
    class="inline-block shrink-0 overflow-hidden"
    :class="{ 'animate-pulse bg-slate-200 dark:bg-zinc-800': !state.loaded }"
    :style="boxStyle"
  >
    <img
      :key="state.href"
      :src="state.href"
      :alt="alt"
      :width="size"
      :height="size"
      class="block h-full w-full object-contain transition-opacity duration-200"
      :class="state.loaded ? 'opacity-100' : 'opacity-0'"
      decoding="async"
      @load="handleImageLoaded"
      @error="imageLoadError"
    />
  </span>
</template>

<script setup lang="ts">
const emit = defineEmits(["success"]);
const props = defineProps<{
	size?: number;
	href: string;
	failureHref: string;
	alt?: string;
}>();
const state = reactive({
	error: false,
	loaded: false,
	href: props.href || props.failureHref,
});
const boxStyle = computed(() =>
	props.size ? { width: `${props.size}px`, height: `${props.size}px` } : undefined,
);

const reset = () => {
	state.error = false;
	state.loaded = false;
	state.href = props.href || props.failureHref;
};
watch(toRef(props, "href"), reset);

function imageLoadError() {
	if (state.error || state.href === props.failureHref) {
		// Stop the error loop; the fallback itself is unavailable.
		state.loaded = true;
		return;
	}

	state.error = true;
	state.loaded = false;
	state.href = props.failureHref;
}

const handleImageLoaded = () => {
	state.loaded = true;
	// Only the requested image counts as success, not the fallback.
	if (!state.error && props.href) {
		emit("success");
	}
};
</script>
