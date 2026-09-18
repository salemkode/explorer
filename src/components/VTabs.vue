<template>
  <div class="my-4">
    <NavPills
      :select="active"
      :items="items"
      @update:select="updateActive"
    />
    <div
      class="flex flex-col"
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

<script setup lang="ts">
const TransitionTime = 300;
const active = ref(0);
const props = defineProps<{
	items: readonly string[];
}>();

const updateActive = (value: number) => {
	active.value = -1;
	setTimeout(() => {
		active.value = value;
	}, TransitionTime + 10);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--fade-transition, 300ms) ease;
}
</style>
