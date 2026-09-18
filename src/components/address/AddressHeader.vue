<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 transition-colors relative z-20">
    <!-- QR Code Wrapper -->
    <div
      class="relative shrink-0 rounded-xl p-1.5 bg-white border border-slate-200 dark:border-zinc-700 shadow-xs"
      :class="{ 'z-30': scaleQr }"
    >
      <vue-qr-code :scale="scaleQr" :content="qrAddress" />
    </div>

    <!-- Address Details -->
    <div class="flex flex-col items-center sm:items-start justify-center min-w-0 flex-1 text-center sm:text-left">
      <div v-if="addressType" class="mb-2">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {{ addressType }}
        </span>
      </div>

      <div class="flex items-center gap-1.5 max-w-full">
        <BaseCopy
          copy
          warp
          :text="displayAddress"
        />
        <button
          ref="scaleQrBtn"
          type="button"
          class="p-1 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
          title="Zoom QR Code"
          aria-label="Zoom QR Code"
          @click="scaleQr = !scaleQr"
        >
          <i class="uicon-arrows-alt text-xs" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAddressType } from "@/module/bitcoin";
import { normalizeDisplayAddress } from "~/hooks/addressDisplay";

const props = defineProps<{
	address: string;
}>();
const scaleQrBtn = ref();
const scaleQr = ref(false);

const outsideClick = (event: MouseEvent) => {
	if (
		scaleQrBtn.value &&
		!scaleQrBtn.value.contains(event.target as Node) &&
		scaleQr.value
	) {
		scaleQr.value = false;
	}
};

onMounted(() => {
	document.addEventListener("click", outsideClick);
});

onBeforeUnmount(() => {
	document.removeEventListener("click", outsideClick);
});

const qrAddress = computed(() =>
	normalizeDisplayAddress(props.address, {
		removePrefix: false,
	}),
);
const displayAddress = computed(() => normalizeDisplayAddress(props.address));
const addressType = computed(() => getAddressType(qrAddress.value));
</script>
