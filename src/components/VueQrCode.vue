<template>
  <svg
    v-if="graphic"
    class="block h-auto max-w-full rounded-[10px] bg-white"
    :width="size"
    :height="size"
    :viewBox="`0 0 ${graphic.side} ${graphic.side}`"
    role="img"
    :aria-label="`QR code for ${content}`"
  >
    <title>{{ `QR code for ${content}` }}</title>
    <rect width="100%" height="100%" fill="white" />
    <path :d="graphic.path" fill="#1c7d43" />
    <g
      v-for="[x, y] in graphic.finders"
      :key="`${x},${y}`"
      :transform="`translate(${x} ${y})`"
    >
      <rect x=".5" y=".5" width="6" height="6" rx=".25" fill="none" stroke="#13532d" />
      <rect x="2" y="2" width="3" height="3" rx=".5" fill="#70c559" />
    </g>
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
	const finderSize = 7;
	const farFinder = modules - finderSize;
	const darkModules = [];
	for (let row = 0; row < modules; row++) {
		for (let column = 0; column < modules; column++) {
			const inFinder =
				(row < finderSize && (column < finderSize || column >= farFinder)) ||
				(row >= farFinder && column < finderSize);
			if (inFinder || !code.isDark(row, column)) continue;

			darkModules.push(
				`M${column + margin} ${row + margin + 0.5}a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0z`,
			);
		}
	}
	return {
		side: modules + 2 * margin,
		path: darkModules.join(""),
		finders: [
			[margin, margin],
			[farFinder + margin, margin],
			[margin, farFinder + margin],
		],
	};
});
</script>
