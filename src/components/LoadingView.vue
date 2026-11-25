<template>
  <div role="status" aria-busy="true" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
    <span class="sr-only" v-text="$t('loading')" />
    <!-- Details card -->
    <div class="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 shadow-xs divide-y divide-slate-100 dark:divide-zinc-800/80">
      <div v-for="i in 5" :key="i" class="py-3 first:pt-0 last:pb-0">
        <Skeleton class="h-2.5 w-24 mb-2.5" />
        <Skeleton class="h-4" :class="i % 2 ? 'w-full' : 'w-2/3'" />
      </div>
    </div>

    <div class="lg:col-span-8 space-y-6 min-w-0">
      <!-- Header card -->
      <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs flex items-center gap-4">
        <Skeleton class="size-14 rounded-xl" />
        <div class="flex-1 space-y-2.5">
          <Skeleton class="h-5 w-40" />
          <Skeleton class="h-3.5 w-3/4" />
        </div>
      </div>
      <!-- List card -->
      <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80">
          <Skeleton class="h-4 w-32" />
        </div>
        <div class="divide-y divide-slate-100 dark:divide-zinc-800/60">
          <div v-for="i in 5" :key="i" class="px-5 py-4 flex items-center gap-6">
            <Skeleton class="h-4 w-1/3" />
            <Skeleton class="h-4 w-1/4 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
