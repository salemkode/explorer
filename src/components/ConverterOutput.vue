<template>
	<section class="rounded-xl border border-slate-200 dark:border-zinc-700 p-4 space-y-3" :aria-labelledby="`${id}-title`">
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h3 :id="`${id}-title`" class="text-sm font-semibold text-slate-900 dark:text-white">{{ title }}</h3>
			<button
				type="button"
				class="rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:opacity-60"
				:aria-label="`Copy ${title.toLowerCase()}`"
				:disabled="copyStatus === 'copying'"
				@click="copyAddress"
			>
				{{ copyStatus === 'copying' ? 'Copying…' : 'Copy' }}
			</button>
		</div>
		<p class="text-xs text-slate-500 dark:text-zinc-400">{{ description }}</p>
		<p class="font-mono text-xs sm:text-sm break-all select-all text-slate-800 dark:text-zinc-200">{{ address }}</p>
		<p v-if="copyStatus === 'copied'" role="status" class="text-xs text-emerald-700 dark:text-emerald-300">{{ title }} copied.</p>
		<p v-if="copyStatus === 'failed'" role="alert" class="text-xs text-rose-600 dark:text-rose-400">Could not copy. Select the address above and copy it manually.</p>
		<details>
			<summary class="w-fit cursor-pointer rounded-sm text-xs font-medium text-emerald-700 dark:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500">Show QR code</summary>
			<div class="mt-3 w-fit bg-white rounded-xl p-3" role="img" :aria-label="`${title} QR code: ${address}`">
				<VueQrCode :content="address" :size="180" />
			</div>
		</details>
	</section>
</template>

<script setup lang="ts">
const props = defineProps<{
	id: string;
	title: string;
	description: string;
	address: string;
}>();

const copyStatus = ref("idle");

async function copyAddress() {
	copyStatus.value = "copying";
	try {
		await navigator.clipboard.writeText(props.address);
		copyStatus.value = "copied";
	} catch {
		copyStatus.value = "failed";
	}
}
</script>
