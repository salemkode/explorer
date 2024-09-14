<template>
  <div
    ref="reference"
    class="btn dropdown-toggle"
    type="button"
    @click="openDropDown"
  >
    {{ title }}
    <ul
      ref="floating"
      :style="{
        position: strategy,
        top: `${(y || 0) + 10}px`,
        left: `${x || 0}px`,
        width: '300px',
      }"
      class="dropdown-menu dropdown-menu-lg-end"
      :class="{ show: open }"
    >
      <li v-for="item in items" :key="item.name">
        <a class="dropdown-item" :href="item.href" v-text="item.name" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { autoUpdate, useFloating } from "@floating-ui/vue";

const open = ref(false);
const reference = ref(null);
const floating = ref(null);
defineProps<{
	title: string;
	items: {
		name: string;
		href: string;
	}[];
}>();
const { x, y, strategy, update } = useFloating(reference, floating, {
	strategy: "fixed",
	placement: "bottom-start",
	open,
	whileElementsMounted: autoUpdate,
});

document.addEventListener("click", (event) => {
	if (reference.value !== event.target) {
		open.value = false;
	}
});
const openDropDown = () => {
	update();
	open.value = !open.value;
};
</script>
