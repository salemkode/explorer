<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs transition-colors space-y-6">
      <div class="border-b border-slate-100 dark:border-zinc-800 pb-4">
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          {{ $t("settings") }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Customize your preferences and display settings.
        </p>
      </div>

      <!-- Appearance / Theme -->
      <div>
        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
          {{ $t("appearance") }}
        </h2>
        <div class="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            class="flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer text-center"
            :class="
              storedTheme === 'system'
                ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300'
            "
            @click="storedTheme = 'system'"
          >
            <svg class="w-5 h-5 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span class="text-xs">System</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer text-center"
            :class="
              storedTheme === 'light'
                ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300'
            "
            @click="storedTheme = 'light'"
          >
            <svg class="w-5 h-5 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span class="text-xs">Light</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer text-center"
            :class="
              storedTheme === 'dark'
                ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300'
            "
            @click="storedTheme = 'dark'"
          >
            <svg class="w-5 h-5 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span class="text-xs">Dark</span>
          </button>
        </div>
      </div>

      <hr class="border-slate-100 dark:border-zinc-800" />

      <!-- Address Display Format -->
      <div>
        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
          {{ $t("address_display_format") }}
        </h2>

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
            <div
              class="mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors"
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
                Shows token-enabled cashaddr format (recommended for CashTokens)
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
            <div
              class="mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors"
              :class="addressDisplayMode === 'regular' ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500' : 'border-slate-300 dark:border-zinc-600'"
            >
              <div v-if="addressDisplayMode === 'regular'" class="w-1.5 h-1.5 rounded-full bg-white" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">
                {{ $t("regular_address") }}
              </div>
              <p class="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Shows standard regular cashaddr format without token prefix
              </p>
            </div>
          </button>
        </div>
      </div>

      <hr class="border-slate-100 dark:border-zinc-800" />

      <!-- IPFS Gateway Settings -->
      <div>
        <IpfsGatewaySettings />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { addressDisplayMode } from "~/hooks/addressDisplay";
import { storedTheme } from "~/hooks/theme";
</script>
