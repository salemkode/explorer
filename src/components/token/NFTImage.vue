<template>
  <div class="w-full">
    <button
      type="button"
      class="w-full rounded-lg overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500 disabled:cursor-default"
      aria-label="View token image"
      aria-haspopup="dialog"
      :disabled="pending || status !== 'ready' || placeholder"
      @click="dialog?.showModal()"
    >
      <img
        :key="source"
        :src="source"
        :alt="placeholder ? 'Generated token placeholder' : name"
        class="aspect-square w-full object-contain"
        @load="status = 'ready'"
        @error="imageFailed"
      />
    </button>
    <p v-if="!pending && status === 'loading'" role="status" class="mt-2 text-xs text-slate-500 dark:text-zinc-400">Loading image…</p>
    <p v-else-if="!pending && (placeholder || status === 'unavailable')" class="mt-2 text-xs text-slate-500 dark:text-zinc-400">Image unavailable</p>
    <!-- Native dialog supplies Escape dismissal, focus trapping and focus restoration. -->
    <dialog
      ref="dialog"
      :aria-label="`${name} — full image`"
      class="m-auto w-[min(90vw,48rem)] max-h-[90dvh] overflow-auto rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl backdrop:bg-black/70 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
      @click.self="dialog?.close()"
      @keydown.esc.prevent="dialog?.close()"
    >
      <div class="mb-3 flex items-center justify-between gap-4">
        <p class="min-w-0 break-words font-semibold">{{ name }}</p>
        <button
          type="button"
          autofocus
          aria-label="Close token image"
          class="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-emerald-500 dark:border-zinc-700 dark:hover:bg-zinc-800"
          @click="dialog?.close()"
        >Close</button>
      </div>
      <img :src="source" :alt="name" class="mx-auto max-h-[70dvh] max-w-full object-contain" />
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from "vue";
import { createIdenticon } from "~/module/IconGenerator";
import { getHttpsUrl, svgToBase64 } from "~/module/utils";

const props = defineProps<{
	category: string;
	name: string;
	image?: string;
	icon?: string;
	pending?: boolean;
}>();
const dialog = useTemplateRef("dialog");
const sources = computed(() => [
	...new Set([props.image, props.icon].filter(Boolean).map(getHttpsUrl)),
	svgToBase64(createIdenticon(props.category)),
]);
const sourceIndex = ref(0);
const status = ref<"loading" | "ready" | "unavailable">("loading");
const source = computed(() => sources.value[sourceIndex.value]);
const placeholder = computed(() => sourceIndex.value === sources.value.length - 1);

watch(sources, () => {
	sourceIndex.value = 0;
});
watch(source, () => {
	dialog.value?.close();
	status.value = "loading";
});

function imageFailed() {
	if (placeholder.value) {
		status.value = "unavailable";
		return;
	}
	sourceIndex.value += 1;
	status.value = "loading";
}
</script>
