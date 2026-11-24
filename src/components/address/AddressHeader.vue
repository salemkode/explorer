<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
    <button
      type="button"
      class="group shrink-0 cursor-zoom-in overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-zinc-700 dark:hover:border-emerald-500"
      aria-haspopup="dialog"
      :aria-controls="dialogId"
      @click="qrDialog?.showModal()"
    >
      <VueQrCode :content="qrAddress" aria-hidden="true" />
      <span class="flex items-center justify-center gap-1.5 border-t border-slate-200 bg-slate-50 py-1.5 text-xs font-medium group-hover:text-emerald-700">
        <i class="uicon-arrows-alt" aria-hidden="true" />
        Enlarge QR
      </span>
    </button>

    <div class="flex min-w-0 flex-1 flex-col items-center gap-2 text-center sm:items-start sm:text-left">
      <span v-if="addressType" class="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        {{ addressType }}
      </span>
      <BaseCopy copy warp :text="displayAddress" />
    </div>

    <dialog
      :id="dialogId"
      ref="qrDialog"
      :aria-labelledby="`${dialogId}-title`"
      class="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      @click.self="qrDialog?.close()"
      @keydown.esc="qrDialog?.close()"
    >
      <div class="space-y-4 p-4 sm:p-5">
        <div class="flex items-center justify-between gap-4">
          <h2 :id="`${dialogId}-title`" class="text-base font-semibold">Scan address</h2>
          <button
            type="button"
            autofocus
            class="cursor-pointer rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:text-zinc-300 dark:hover:bg-zinc-800"
            @click="qrDialog?.close()"
          >
            Close
          </button>
        </div>
        <div class="mx-auto w-fit max-w-full rounded-xl border border-slate-200 bg-white dark:border-zinc-700">
          <VueQrCode :content="qrAddress" :size="272" />
        </div>
        <p class="select-all break-all text-center font-mono text-xs text-slate-600 dark:text-zinc-300">
          {{ qrAddress }}
        </p>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { getAddressType } from "@/module/bitcoin";
import { normalizeDisplayAddress } from "~/hooks/addressDisplay";

const props = defineProps<{
	address: string;
}>();

const dialogId = useId();
const qrDialog = ref<HTMLDialogElement | null>(null);

const qrAddress = computed(() =>
	normalizeDisplayAddress(props.address, {
		removePrefix: false,
	}) || "",
);
const displayAddress = computed(() => normalizeDisplayAddress(props.address));
const addressType = computed(() => getAddressType(qrAddress.value));
</script>
