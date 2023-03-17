<template>
  <svg class="stat-circle" width="80" viewBox="0 0 20 20">
    <circle class="bg" cx="10" cy="10" r="8"></circle>
    <circle
      class="progress-hover"
      cx="10"
      cy="10"
      r="8"
      :style="{ strokeDashoffset: hoverStrokeDashoffset }"
    ></circle>
    <circle
      class="progress"
      cx="10"
      cy="10"
      r="8"
      :style="{ strokeDashoffset: strokeDashoffset }"
    ></circle>
    <text x="50%" y="55%">{{ props.percentage }}%</text>
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
  const p = parseFloat(props.percentage.toString());
  const off = -51 - (51 / 100) * p;
  return off;
});

const hoverStrokeDashoffset = ref(0);
setInterval(() => (hoverStrokeDashoffset.value -= 51), 1000);
</script>

<style scoped>
.stat-circle circle.bg {
  fill: none;
  stroke: #f1f1f1;
  stroke-width: 2;
}

.stat-circle circle {
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}

.stat-circle circle.progress,
.stat-circle circle.progress-hover {
  fill: none;
  stroke-width: 2;
  stroke-dasharray: 51 51;
  transition: 1s stroke-dashoffset;
  stroke-linecap: round;
}

.stat-circle circle.progress {
  stroke: #2ecc70;
}

.stat-circle circle.progress-hover {
  transition: 1s stroke-dashoffset linear;
  stroke: #2ecc704d;
}

.stat-circle text {
  font-size: 3px;
  text-anchor: middle;
  fill: #555;
}
</style>
