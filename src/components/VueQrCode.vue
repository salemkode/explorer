<template>
  <svg
    v-if="graphic"
    class="block h-auto max-w-full rounded-lg bg-white text-slate-950"
    :width="size"
    :height="size"
    :viewBox="`0 0 ${graphic.side} ${graphic.side}`"
    shape-rendering="crispEdges"
    role="img"
    :aria-label="`QR code for ${content}`"
  >
    <rect width="100%" height="100%" fill="white" />
    <path :d="graphic.path" fill="currentColor" />
  </svg>
</template>

<script setup lang="ts">
import qrcode from "qrcode-generator";
import { computed } from "vue";

const props = withDefaults(defineProps<{ content: string; size?: number }>(), {
	size: 112,
});

const graphic = computed(() => {
	if (!props.content) return;

	const code = qrcode(0, "M");
	code.addData(props.content);
	code.make();

	// A four-module white border keeps the code scannable on any surface.
	const margin = 4;
	const modules = code.getModuleCount();
	const darkModules = [];
	for (let row = 0; row < modules; row++) {
		for (let column = 0; column < modules; column++) {
			if (code.isDark(row, column)) {
				darkModules.push(`M${column + margin} ${row + margin}h1v1h-1z`);
			}
		}
	}
	return { side: modules + 2 * margin, path: darkModules.join("") };
});
</script>
