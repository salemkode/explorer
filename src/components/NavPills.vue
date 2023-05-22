<template>
  <div class="d-flex text-center">
    <div
      v-for="(item, index) in props.items"
      :key="index"
      class="pointer w-100 p-2"
      @click="navItem = index"
    >
      <span
        class="nav-item pointer d-inline-block"
        :class="{
          active: navItem === index,
        }"
      >
        {{ $t(item) }}
        <div class="nav-line bg-primary mt-1" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: string[];
  select: number;
}>();

const emit = defineEmits<{
  (event: "update:select", value: number): void;
}>();

const navItem = computed({
  get() {
    return props.select;
  },
  set(value) {
    emit("update:select", value);
  },
});
</script>

<style lang="scss" scoped>
.nav-item {
  &.active {
    font-weight: bold;

    .nav-line {
      opacity: 1;
    }
  }

  .nav-line {
    opacity: 0;
    height: 6px;
    border-radius: 5px;
    transform: scaleX(1.3);
    transition: opacity 0.5s;
  }
}
</style>
