<template>
  <div ref="containerRef" :style="style" @transitionend="onTransitionEnd">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const style = ref<Record<string, string>>({});
const containerRef = ref<HTMLElement | null>(null);

const props = defineProps({
	active: Boolean,
	duration: {
		type: Number,
		default: 500,
	},
});

const setHeight = (temp: string, afterRelayout: () => string) => {
	style.value = { maxHeight: temp };

	nextTick(() => {
		// force relayout so the animation will run
		style.value = {
			maxHeight: afterRelayout(),
			overflow: "hidden",
			"transition-property": "max-height",
			"transition-duration": `${props.duration}ms`,
		};
	});
};

watch(
	props,
	() => {
		if (props.active) {
			setHeight("0px", () => `${containerRef.value?.scrollHeight}px`);
		} else {
			setHeight(`${containerRef.value?.scrollHeight}px`, () => "0px");
		}
	},
	{
		immediate: true,
	},
);

const onTransitionEnd = (event: TransitionEvent) => {
	// Don't do anything if the transition doesn't belong to the container
	if (event.target !== containerRef.value) return;

	if (props.active) {
		style.value = {
			maxHeight: `${containerRef.value?.scrollHeight}px`,
		};
	} else {
		style.value = {
			maxHeight: "0",
			overflow: "hidden",
		};
	}
};
</script>
