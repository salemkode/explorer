<script setup lang="ts">
import { useRegistryStore } from "~/store";
type Status = {
	type: "ready" | "loading";
	errorMessage?: string;
};
const registryStore = useRegistryStore();
const url = ref("");
const status = ref<Status>({
	type: "ready",
});

const addRegisters = async () => {
	status.value.type = "loading";
	const result = await registryStore.addRegistryProvider(url.value);
	status.value = {
		type: "ready",
		errorMessage: result.errorMessage,
	};
};
</script>

<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs transition-colors space-y-3">
    <h3 class="text-sm font-bold text-slate-900 dark:text-white">
      Add Custom BCMR Registry
    </h3>
    <p class="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
      Control who you want to verify tokens from and source token metadata from.
    </p>
    <div class="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] font-medium">
      Note: You must trust the registry provider.
    </div>

    <div class="flex items-center gap-2 pt-1">
      <input
        v-model="url"
        name="register-url"
        type="url"
        class="flex-1 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        placeholder="https://registry.example/bcmr.json"
        :disabled="status.type !== 'ready'"
      />
      <button
        type="button"
        :disabled="status.type !== 'ready' || !url.trim()"
        class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        @click="addRegisters"
      >
        <span>Add</span>
        <LoadingSpinner
          v-if="status.type === 'loading'"
          small
        />
      </button>
    </div>

    <div v-if="status.errorMessage" class="text-xs text-rose-500 font-medium">
      {{ status.errorMessage }}
    </div>
  </div>
</template>
