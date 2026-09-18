<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      leave-active-class="transition-opacity duration-200 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-slate-950/40 dark:bg-black/60 backdrop-blur-xs"
        aria-hidden="true"
        @click="emit('close')"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      leave-active-class="transition-transform duration-200 ease-in"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="open"
        class="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] max-w-full bg-white dark:bg-zinc-900 border-l border-slate-200/80 dark:border-zinc-800 shadow-2xl flex flex-col transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-drawer-title"
      >
        <!-- Header -->
        <header class="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 id="settings-drawer-title" class="text-base font-bold text-slate-900 dark:text-white">
                {{ $t("settings") }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                Preferences & Display
              </p>
            </div>
          </div>

          <button
            type="button"
            class="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close settings"
            @click="emit('close')"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <!-- Body (Scrollable) -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <!-- Appearance / Theme -->
          <section class="space-y-3">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {{ $t("appearance") }}
            </h3>

            <div class="grid grid-cols-3 p-1 rounded-2xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-800 gap-1">
              <button
                type="button"
                class="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none"
                :class="
                  storedTheme === 'system'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200/60 dark:border-zinc-700/60'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-transparent'
                "
                @click="storedTheme = 'system'"
              >
                <svg class="w-4 h-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>System</span>
              </button>

              <button
                type="button"
                class="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none"
                :class="
                  storedTheme === 'light'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200/60 dark:border-zinc-700/60'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-transparent'
                "
                @click="storedTheme = 'light'"
              >
                <svg class="w-4 h-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Light</span>
              </button>

              <button
                type="button"
                class="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none"
                :class="
                  storedTheme === 'dark'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200/60 dark:border-zinc-700/60'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-transparent'
                "
                @click="storedTheme = 'dark'"
              >
                <svg class="w-4 h-4 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span>Dark</span>
              </button>
            </div>
          </section>

          <hr class="border-slate-100 dark:border-zinc-800" />

          <!-- Address Display Format -->
          <section class="space-y-3">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {{ $t("address_display_format") }}
            </h3>

            <div class="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                class="flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer group"
                :class="
                  addressDisplayMode === 'token'
                    ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/30'
                "
                @click="addressDisplayMode = 'token'"
              >
                <div class="mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors"
                  :class="addressDisplayMode === 'token' ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500' : 'border-slate-300 dark:border-zinc-600'"
                >
                  <div v-if="addressDisplayMode === 'token'" class="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-sm font-semibold text-slate-900 dark:text-white">
                      {{ $t("token_address") }}
                    </span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Recommended
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Token-aware cashaddr format supporting CashTokens FTs & NFTs.
                  </p>
                </div>
              </button>

              <button
                type="button"
                class="flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer group"
                :class="
                  addressDisplayMode === 'regular'
                    ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/30'
                "
                @click="addressDisplayMode = 'regular'"
              >
                <div class="mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors"
                  :class="addressDisplayMode === 'regular' ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500' : 'border-slate-300 dark:border-zinc-600'"
                >
                  <div v-if="addressDisplayMode === 'regular'" class="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">
                    {{ $t("regular_address") }}
                  </div>
                  <p class="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Standard regular cashaddr format without token prefix.
                  </p>
                </div>
              </button>
            </div>
          </section>

          <hr class="border-slate-100 dark:border-zinc-800" />

          <!-- IPFS Gateway Settings -->
          <section>
            <IpfsGatewaySettings heading-tag="h3" />
          </section>

          <hr class="border-slate-100 dark:border-zinc-800" />

          <!-- Network & Connection Status -->
          <section class="space-y-3">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Network Status
            </h3>
            <div class="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <div class="text-xs font-semibold text-slate-900 dark:text-white capitalize">
                  {{ stateStore.network || 'Chipnet' }}
                </div>
                <div class="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                  Chaingraph Connected
                </div>
              </div>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
          </section>
        </div>

        <!-- Footer -->
        <footer class="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 shrink-0">
          <span class="text-xs text-slate-400 dark:text-zinc-500">
            Auto-saved
          </span>
          <button
            type="button"
            class="px-5 py-2 rounded-xl bg-bch-green hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            @click="emit('close')"
          >
            Done
          </button>
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { addressDisplayMode } from "~/hooks/addressDisplay";
import { storedTheme } from "~/hooks/theme";
import { useStateStore } from "~/store";

const emit = defineEmits<(event: "close") => void>();

const props = defineProps<{
	open: boolean;
}>();

const stateStore = useStateStore();

const onKeydown = (event: KeyboardEvent) => {
	if (event.key === "Escape" && props.open) {
		emit("close");
	}
};

onMounted(() => {
	document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
	document.removeEventListener("keydown", onKeydown);
	if (typeof document !== "undefined") {
		document.body.style.overflow = "";
	}
});

watch(
	() => props.open,
	(value) => {
		if (typeof document !== "undefined") {
			document.body.style.overflow = value ? "hidden" : "";
		}
	},
);
</script>
