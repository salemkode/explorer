<script setup lang="ts">
const openNav = ref(false);
const openSettings = ref(false);
const navItems = [
	{ name: "registers", path: "/registers" },
	{ name: "converter", path: "/converter" },
	{ name: "doctor", path: "/doctor" },
];

const route = useRoute();
watch(
	() => route.fullPath,
	() => {
		openNav.value = false;
	},
);
</script>

<template>
  <header class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-zinc-950/85 border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
    <nav-search />
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Brand Link -->
        <router-link
          to="/"
          class="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-lg tracking-tight hover:opacity-90 transition-opacity"
        >
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20">
            <img src="/bch.svg" width="22" height="22" alt="Bitcoin Cash Logo" class="drop-shadow-sm" />
          </div>
          <span class="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent font-extrabold text-base sm:text-lg">
            Bitcoin Cash <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Explorer</span>
          </span>
        </router-link>

        <!-- Desktop Navigation -->
        <ul class="hidden md:flex items-center gap-1.5">
          <li v-for="item in navItems" :key="item.name">
            <router-link
              :to="item.path"
              class="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60"
              active-class="!bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400 !font-semibold border border-emerald-500/20 shadow-xs"
            >
              <span v-text="$t(item.name)" />
            </router-link>
          </li>
          <li>
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-full text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-all cursor-pointer flex items-center gap-1.5"
              @click="openSettings = true"
            >
              <svg class="w-4 h-4 text-slate-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{{ $t("settings") }}</span>
            </button>
          </li>
        </ul>

        <!-- Mobile Menu Toggle Button -->
        <div class="flex md:hidden items-center gap-2">
          <button
            type="button"
            class="p-2 rounded-xl text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/70 transition-colors"
            :aria-label="openNav ? 'Close menu' : 'Open menu'"
            @click="openNav = !openNav"
          >
            <i class="uicon-menu text-xl" />
          </button>
        </div>
      </div>

      <!-- Mobile Menu Dropdown -->
      <div class="md:hidden">
        <SliderUpDown :active="openNav">
          <div class="py-3 px-2 mt-1 mb-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-lg space-y-1">
            <router-link
              v-for="item in navItems"
              :key="item.name"
              :to="item.path"
              class="flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              active-class="!bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400 !font-semibold"
            >
              <span v-text="$t(item.name)" />
            </router-link>

            <button
              type="button"
              class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-left"
              @click="openNav = false; openSettings = true"
            >
              <span v-text="$t('settings')" />
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </SliderUpDown>
      </div>

      <AddressDisplaySettingsDialog
        :open="openSettings"
        @close="openSettings = false"
      />
    </nav>
  </header>
</template>
