<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <component :is="headingTag" class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
        IPFS Gateway
      </component>
      <button
        v-if="selectedIpfsGateway"
        type="button"
        class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
        @click="clearCustom"
      >
        Reset to Default
      </button>
    </div>
    <p class="text-xs text-slate-500 dark:text-zinc-400">
      Choose the public gateway used to load token icons and metadata.
    </p>

    <!-- Gateway Preset Chips -->
    <div class="grid grid-cols-2 gap-2">
      <button
        type="button"
        class="flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer"
        :class="
          !selectedIpfsGateway
            ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
            : 'border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40'
        "
        @click="selectedIpfsGateway = ''"
      >
        <span class="truncate">Filebase (Default)</span>
        <svg v-if="!selectedIpfsGateway" class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </button>

      <button
        v-for="gateway in PUBLIC_IPFS_GATEWAYS"
        :key="gateway.url"
        type="button"
        class="flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer"
        :class="
          selectedIpfsGateway === gateway.url
            ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
            : 'border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40'
        "
        @click="selectedIpfsGateway = gateway.url"
      >
        <span class="truncate">{{ gateway.name }}</span>
        <svg v-if="selectedIpfsGateway === gateway.url" class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>

    <!-- Custom Gateway Input -->
    <div class="pt-1">
      <label class="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5" :for="`${id}-custom-gateway`">
        Custom Gateway URL
      </label>
      <div class="relative flex items-center">
        <input
          :id="`${id}-custom-gateway`"
          v-model="customUrl"
          class="w-full rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 py-2.5 pl-3.5 pr-8 text-xs font-mono text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          type="url"
          placeholder="https://your-gateway.example"
          spellcheck="false"
          @input="onCustomInput"
        />
        <button
          v-if="customUrl"
          type="button"
          class="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-md text-xs cursor-pointer"
          @click="clearCustom"
        >
          ✕
        </button>
      </div>
      <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
        Enter a gateway origin without the trailing <code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-[10px]">/ipfs</code> path.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PUBLIC_IPFS_GATEWAYS, selectedIpfsGateway } from "~/module/ipfs";

withDefaults(
	defineProps<{
		headingTag?: string;
	}>(),
	{ headingTag: "h5" },
);

const id = useId();

const customUrl = ref(
	PUBLIC_IPFS_GATEWAYS.some((g) => g.url === selectedIpfsGateway.value) ||
		!selectedIpfsGateway.value
		? ""
		: selectedIpfsGateway.value,
);

const onCustomInput = () => {
	selectedIpfsGateway.value = customUrl.value.trim();
};

const clearCustom = () => {
	customUrl.value = "";
	selectedIpfsGateway.value = "";
};

watch(selectedIpfsGateway, (val) => {
	if (PUBLIC_IPFS_GATEWAYS.some((g) => g.url === val) || !val) {
		customUrl.value = "";
	} else {
		customUrl.value = val;
	}
});
</script>
