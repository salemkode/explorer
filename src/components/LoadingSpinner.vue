<template>
  <div class="inline-flex flex-col items-center justify-center">
    <svg
      class="animate-spin text-emerald-500"
      :class="small ? 'w-4 h-4' : 'w-7 h-7'"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="loading"
    >
      <circle
        class="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="3"
      />
      <path
        class="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <p v-if="text" class="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-2">
      {{ text }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
	text?: string;
	small?: boolean;
}>();
</script>
