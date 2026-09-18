<template>
  <div class="flex flex-col items-center justify-center py-24 px-4 w-full">
    <div class="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 mb-4 shadow-glow">
      <img src="/bch.svg" width="32" height="32" alt="Bitcoin Cash" class="animate-pulse" />
      <div class="absolute inset-0 rounded-2xl border-2 border-emerald-500/40 animate-ping opacity-25" />
    </div>
    <div class="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-zinc-400">
      <LoadingSpinner small />
      <span v-text="$t('loading_dank_memes')" />
    </div>
  </div>
</template>
