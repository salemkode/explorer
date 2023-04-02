<template>
  <svg
    class="stat-circle"
    :class="{
      full: props.percentage >= 100,
    }"
    width="80"
    height="80"
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
      stroke="white"
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
setInterval(() => {
  if (props.percentage !== 100) {
    hoverStrokeDashoffset.value -= 51;
  } else if (hoverStrokeDashoffset.value % -51 !== 0) {
    hoverStrokeDashoffset.value -= 51;
  }
}, 1000);
</script>

<style scoped>
.stat-circle circle.bg {
  fill: none;
  stroke: #f1f1f1;
  stroke-width: 2;
  transition: 1s all;
}

.stat-circle.full circle.bg {
  fill: #2ecc70;
  stroke: none;
}

.stat-circle.full circle:is(.progress, .progress-hover) {
  animation: full 1s;
}

.stat-circle circle {
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}

.stat-circle circle:is(.progress, .progress-hover) {
  fill: none;
  stroke-width: 2;
  stroke-dasharray: 51 51;
  transition: 1s all;
  stroke-linecap: round;
}

.stat-circle circle.progress {
  stroke: #2ecc70;
}

.stat-circle circle.progress-hover {
  transition: 1s stroke-dashoffset linear;
  stroke: #2ecc704d;
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
