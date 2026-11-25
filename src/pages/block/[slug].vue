<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <AdBanner slot-id="block-top" class="mb-6" />

    <div v-if="result?.block.length" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Block Info Warp -->
      <div class="lg:col-span-4 space-y-6">
        <content-warp :loading="false" :items="blockItemWarp" />
      </div>

      <!-- Right Column: Header Navigator & Transactions -->
      <div class="lg:col-span-8 space-y-6">
        <BlockHeader :height="result.block.at(0)?.height || ''" />
        <BlockTransaction
          v-model:offset="offsetTxs"
          :limit="variable.limitTxs"
          :transactions="transactions"
          :loading="loading"
        />
      </div>
    </div>
    <LoadingView v-else-if="loading" />
    <p v-else-if="error" role="alert" class="py-16 text-center text-sm text-rose-600 dark:text-rose-400">
      Block details could not be loaded. Check your connection and reload the page.
    </p>
    <p v-else role="status" class="py-16 text-center text-sm text-slate-500 dark:text-zinc-400">
      Block not found.
    </p>
  </div>
</template>

<script setup lang="ts">
import { useUsdPrice } from "~/hooks/usdPrice";
import { GetBlock } from "~/module/chaingraph";
import { useStateStore } from "~/store";
import type { bytea, contentWarpItem } from "~/types";

// Get slug from router param using useRouter
const route = useRoute();
const blockHashOrHeight = computed(() => route.params.slug as string);
const stateStore = useStateStore();
const { formatPrice } = useUsdPrice();

const offsetTxs = ref(0);
const variable = computed(() => ({
	network: stateStore.network,
	hash: `\\x${blockHashOrHeight.value}` as bytea,
	height: Number.isNaN(+blockHashOrHeight.value)
		? "-1"
		: blockHashOrHeight.value,
	limitTxs: 9,
	offsetTxs: offsetTxs.value,
}));
const { result, loading, error } = useQuery(GetBlock, variable);
const blockItemWarp = computed<contentWarpItem[]>(() => {
	const block = result.value?.block.at(0);
	if (!block) return [];

	return [
		{
			title: "Block Hash",
			text: block?.hash.substring(2),
			copy: true,
			warp: true,
		},
		{
			title: "Block Height",
			text: block?.height,
			copy: true,
			warp: true,
		},
		{
			title: "Input Total",
			text: formatPrice(block.input_value_satoshis || "0"),
		},
		{
			title: "Output Total",
			text: formatPrice(block.output_value_satoshis || "0"),
		},
		{
			title: "Input Count",
			text: block.input_count,
		},
		{
			title: "Output Count",
			text: block.output_count,
		},
	];
});

const transactions = computed(() => {
	const block = result.value?.block.at(0);
	if (!block) {
		return [];
	}
	return block.transactions?.map(({ transaction }) => transaction);
});
</script>
