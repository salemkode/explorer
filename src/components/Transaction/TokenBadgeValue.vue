<script setup lang="ts">
defineProps<{
	display: string;
	exact: string;
	label: string;
	raw?: string;
}>();
</script>

<template>
  <details class="group min-w-0 max-w-full">
    <summary
      class="inline-flex max-w-full items-center gap-1 -my-1 py-1 rounded-sm cursor-pointer list-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 [&::-webkit-details-marker]:hidden"
      :title="exact"
      :aria-label="`${label}: ${exact}. Inspect exact value`"
    >
      <span class="font-mono break-all">{{ display }}</span>
      <slot />
      <span aria-hidden="true" class="text-[10px] opacity-60 group-open:rotate-180">▾</span>
    </summary>
    <div class="mt-2 pt-2 border-t border-current/20 space-y-2 max-w-sm break-all [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-emerald-500">
      <div>
        <span class="block text-[10px] font-semibold">{{ label }}</span>
        <BaseCopy :text="exact" copy warp />
      </div>
      <div v-if="raw !== undefined && raw !== exact">
        <span class="block text-[10px] font-semibold">Base units (on-chain)</span>
        <BaseCopy :text="raw" copy warp />
      </div>
    </div>
  </details>
</template>
