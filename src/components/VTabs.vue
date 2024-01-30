<template>
  <div class="my-4">
    <NavPills
      :select="active"
      :items="items as string[]"
      @update:select="updateActive"
    />
    <div
      class="d-flex flex-column"
      :style="{
        '--fade-transition': `${TransitionTime}ms`,
      }"
    >
      <template v-for="(item, index) in props.items" :key="index">
        <Transition name="fade">
          <div
            v-show="active === index"
            :style="`order: ${active === index ? 0 : 1};`"
          >
            <slot :name="item" />
          </div>
        </Transition>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts" generic="TItem extends readonly string[]">
const TransitionTime = 500;
const active = ref(0);
const props = defineProps<{
  items: TItem;
}>();

const updateActive = (value: number) => {
  // Hide first one
  active.value = -1;
  setTimeout(() => {
    active.value = value;
  }, TransitionTime + 10);
};

defineSlots<{
  [k in TItem[number]]: (props: Record<string, unknown>) => void;
}>();
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--fade-transition) ease;
}
</style>
