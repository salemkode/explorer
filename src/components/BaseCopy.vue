<template>
  <span
    class="inline-flex items-center gap-1 max-w-full"
    :class="{
      'break-all': !!props.warp,
    }"
  >
    <component :is="props.short ? PopOver : 'span'" :msg="String(props.text)">
      <NuxtLink
        v-if="props.url"
        :to="props.url"
        class="font-mono text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors break-all"
      >
        {{ text }}
      </NuxtLink>
      <span v-else class="font-mono text-xs sm:text-sm text-slate-800 dark:text-zinc-200 break-all">
        {{ text }}
      </span>
    </component>

    <button
      v-if="props.text && props.copy"
      type="button"
      class="text-slate-400 hover:text-emerald-600 dark:text-zinc-500 dark:hover:text-emerald-400 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800/80 cursor-pointer inline-flex items-center justify-center shrink-0"
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
      @click="copy"
    >
      <i class="uicon-duplicate text-xs" />
    </button>

    <!-- Copied Floating Toast -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        leave-active-class="transition-all duration-150 ease-in"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div
          v-if="showPopup"
          class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 dark:bg-zinc-800/95 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl border border-slate-700/80 dark:border-zinc-700/80 pointer-events-none"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Copied to clipboard!</span>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { shortTx } from "~/module/utils";
import PopOver from "./PopOver.vue";

const text = computed(() => {
	if (props.text === null || props.text === undefined) return "";
	if (props.short && typeof props.text === "string") {
		return shortTx(props.text);
	}

	return props.text;
});

const props = defineProps<{
	text?: string | number | null;
	short?: boolean;
	url?: string;
	copy: boolean;
	warp?: boolean;
}>();

const showPopup = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

function fallbackCopyTextToClipboard(text: string): void {
	const textArea = document.createElement("textarea");
	textArea.value = text;
	textArea.style.top = "0";
	textArea.style.left = "0";
	textArea.style.position = "fixed";

	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		document.execCommand("copy");
	} catch (err) {
		console.error("Fallback: unable to copy", err);
	}

	document.body.removeChild(textArea);
}

const copy = async () => {
	if (timer) clearTimeout(timer);

	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(String(props.text));
	} else {
		await navigator.clipboard.writeText(String(props.text));
	}

	showPopup.value = true;
	timer = setTimeout(() => {
		showPopup.value = false;
	}, 1500);
};
</script>
