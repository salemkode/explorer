<template>
  <div class="relative overflow-hidden py-16 sm:py-24 bg-slate-900 text-white">
    <!-- Background Wallpaper with Overlay -->
    <div
      class="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
      :style="{ backgroundImage: `url(${wallpaper})` }"
    />
    <!-- Emerald Radial Glow -->
    <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/80 to-slate-950 pointer-events-none" />

    <div class="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <!-- Badge -->
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 backdrop-blur-xs">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Bitcoin Cash Blockchain Explorer</span>
      </div>

      <!-- Main Title -->
      <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
        <span v-text="$t('index_page_header')" />
      </h1>

      <p class="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
        <span v-text="$t('index_page_subtext')" />
      </p>

      <!-- Search Box -->
      <div class="max-w-2xl mx-auto relative group">
        <div class="relative flex items-center">
          <div class="absolute left-4.5 text-slate-400 pointer-events-none flex items-center">
            <i class="uicon-search text-base" />
          </div>
          <input
            v-model="query"
            type="text"
            class="w-full pl-12 pr-28 py-3.5 sm:py-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 text-sm sm:text-base border border-slate-200/80 dark:border-zinc-700/80 shadow-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono placeholder:font-sans"
            placeholder="Search by address, transaction ID, or block height"
            aria-label="Search the blockchain"
            @keydown="keydownHandler"
          />
          <button
            type="button"
            class="absolute right-2.5 px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            aria-label="Search"
            @click="search"
          >
            <span>Search</span>
            <span class="text-xs hidden sm:inline opacity-80">↵</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import wallpaper from "~/assets/images/wallpaper.webp";
import { useSearch } from "~/hooks/search";
const { query, search } = useSearch();

function keydownHandler(event: KeyboardEvent) {
	if (event.key === "Enter") {
		search();
	}
}
</script>
