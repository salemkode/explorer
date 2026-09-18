<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-200">
    <BaseHeader />
    <main class="flex-1 w-full">
      <slot />
    </main>
    <Footer />
  </div>
</template>
