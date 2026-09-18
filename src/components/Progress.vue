<template>
  <svg
    class="stat-circle shrink-0"
    :class="{
      full: props.percentage >= 100,
    }"
    width="72"
    height="72"
    viewBox="0 0 20 20"
  >
    <circle class="bg" cx="10" cy="10" r="8" />
    <circle
      class="progress-hover"
      cx="10"
      cy="10"
      r="8"
      :style="{ strokeDashoffset: hoverStrokeDashoffset }"
    />
    <circle
      class="progress"
      cx="10"
      cy="10"
      r="8"
      :style="{ strokeDashoffset: strokeDashoffset }"
    />
    <path
      class="tick"
      d="M6.5 10.5l2 2 5-5"
      stroke="transparent"
      stroke-width="2"
      stroke-linecap="round"
      fill="none"
    />
  </svg>
</template>

<script setup lang="ts">
const props = defineProps({
	percentage: {
		type: Number,
		default: 0,
		required: true,
		validator: (value: number) => value >= 0 && value <= 100,
	},
});
const strokeDashoffset = computed(() => {
	const p = props.percentage;
	const off = -51 - (51 / 100) * p;
	if (p === 100) return -51;
	return off;
});

const hoverStrokeDashoffset = ref(0);
let interval: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
	interval = setInterval(() => {
		if (props.percentage !== 100) {
			hoverStrokeDashoffset.value -= 51;
		} else {
			hoverStrokeDashoffset.value -=
				(hoverStrokeDashoffset.value / 51) % 2 ? 51 : 0;
		}
	}, 1000);
});

onBeforeUnmount(() => {
	if (interval) clearInterval(interval);
});
</script>

<style scoped>
.stat-circle circle {
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: 1s all;
}

.stat-circle circle.bg {
  fill: none;
  stroke: rgba(148, 163, 184, 0.25);
  stroke-width: 2;
}

:global(.dark) .stat-circle circle.bg {
  stroke: rgba(63, 63, 70, 0.5);
}

.stat-circle circle:is(.progress, .progress-hover) {
  fill: none;
  stroke-width: 2;
  stroke-dasharray: 51 51;
  transition: 1s all;
  stroke-linecap: round;
}

.stat-circle circle.progress {
  stroke: #10b981;
}

.stat-circle circle.progress-hover {
  transition: 1s stroke-dashoffset linear;
  stroke: rgba(16, 185, 129, 0.25);
}

.stat-circle.full .tick {
  stroke: white;
}

.stat-circle.full circle.bg {
  fill: #10b981;
  stroke: none;
}

.stat-circle.full circle:is(.progress, .progress-hover) {
  animation: full 1s;
}

@keyframes full {
  from {
    stroke-dashoffset: -102 !important;
  }
  to {
    stroke-dashoffset: 0 !important;
  }
}
</style>
