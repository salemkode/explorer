<template>
  <fieldset :aria-describedby="`${id}-help`" class="space-y-3">
    <legend class="sr-only">Address display format</legend>
    <div class="grid grid-cols-1 gap-2.5">
      <label
        v-for="option in options"
        :key="option.value"
        class="flex items-start gap-3 p-3.5 rounded-2xl border text-left cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-emerald-500"
        :class="addressDisplayMode === option.value
          ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs'
          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/30'"
      >
        <input
          v-model="addressDisplayMode"
          type="radio"
          :name="`${id}-format`"
          :value="option.value"
          :aria-describedby="`${id}-${option.value}-description`"
          class="mt-1 w-4 h-4 shrink-0 accent-emerald-600 dark:accent-emerald-500"
        >
        <span class="flex-1 min-w-0">
          <span class="flex flex-wrap items-center gap-2 mb-0.5">
            <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ option.label }}</span>
            <span v-if="option.value === 'auto'" class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Default
            </span>
          </span>
          <span :id="`${id}-${option.value}-description`" class="block text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            {{ option.description }}
          </span>
        </span>
      </label>
    </div>
    <p :id="`${id}-help`" class="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
      Token-aware encoding signals that a receiver accepts CashTokens; it does not prove an address holds tokens.
      Auto uses each input or output’s token data, including NFTs with no fungible amount, never address history.
      On address pages, Auto keeps the opened address’s encoding for display, copying, and QR codes.
      Both encodings identify the same locking script. Changes are saved in this browser.
    </p>
  </fieldset>
</template>

<script setup lang="ts">
import { addressDisplayMode } from "~/hooks/addressDisplay";

const id = useId();
const options = [
	{
		value: "auto",
		label: "Auto · match each input and output",
		description: "Regular BCH CashAddr for BCH-only outputs; token-aware CashAddr for outputs carrying fungible tokens or NFTs.",
	},
	{
		value: "token",
		label: "Always token-aware",
		description: "Use token-aware CashAddr for every address, including BCH-only outputs.",
	},
	{
		value: "regular",
		label: "Always regular BCH",
		description: "Use regular CashAddr for every address. Token details remain visible; use token-aware addresses when receiving tokens.",
	},
];
</script>
