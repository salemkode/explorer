<template>
  <div class="block">
    <div
      class="capacity"
      :style="{
        '--capacity-size': size,
      }"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  sizeBytes: number;
}>();

const size = computed(() => {
  return `${+(props.sizeBytes || 0) / 10_485}%`;
});
</script>

<style lang="scss" scoped>
.block {
  position: relative;

  .capacity {
    width: var(--block-size);
    height: var(--block-size);
    border-radius: 5px;
    background: rgb(238, 238, 238);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow: hidden;

    &::before {
      content: "";
      background-color: var(--bs-primary);
      height: var(--capacity-size);
      transition: height 0.8s linear;
    }
  }
}
</style>
