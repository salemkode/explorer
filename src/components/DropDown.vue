<template>
  <div class="relative inline-block">
    <button
      ref="reference"
      type="button"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/60 transition-colors shadow-xs cursor-pointer"
      @click="openDropDown"
    >
      <span>{{ title }}</span>
      <i class="uicon-angle-small-down text-xs transition-transform duration-200" :class="{ 'rotate-180': open }" />
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        leave-active-class="transition duration-100 ease-in"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <ul
          v-if="open"
          ref="floating"
          :style="{
            position: strategy,
            top: `${(y || 0) + 8}px`,
            left: `${x || 0}px`,
            minWidth: '220px',
          }"
          class="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden"
        >
          <li v-for="item in items" :key="item.name">
            <a
              class="block px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
              v-text="item.name"
            />
          </li>
        </ul>
      </Transition>
    </Teleport>
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

const onDocClick = (event: MouseEvent) => {
	if (
		reference.value &&
		!(reference.value as HTMLElement).contains(event.target as Node)
	) {
		open.value = false;
	}
};

onMounted(() => {
	document.addEventListener("click", onDocClick);
});

onBeforeUnmount(() => {
	document.removeEventListener("click", onDocClick);
});

const openDropDown = () => {
	update();
	open.value = !open.value;
};
</script>
