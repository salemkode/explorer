<template>
  <div class="space-y-4">
    <fieldset aria-label="NFT view" class="flex gap-1 rounded-2xl border border-slate-200/80 bg-slate-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
      <button
        v-for="mode in viewModes"
        :key="mode"
        type="button"
        :aria-pressed="viewMode === mode"
        class="flex-1 rounded-xl px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-emerald-500"
        :class="viewMode === mode ? 'bg-white text-slate-900 shadow-xs dark:bg-zinc-800 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'"
        @click="viewMode = mode"
      >{{ $t(mode === 'grid' ? 'grid_view' : 'table_view') }}</button>
    </fieldset>
    <TableView
      v-if="viewMode === 'table'"
      title="Address NFTs"
      :rows="transactions"
      :columns="['nft', 'category', 'capability', 'commitment']"
      :has-prev-page="!!offset"
      :has-next-page="!!hasNextPage"
      :loading="loading"
      :error="error?.message"
      @next="next(loading, hasNextPage && !error)"
      @previous="previous(loading)"
    />
    <NFTGallery
      v-else
      :items="nfts"
      :loading="loading"
      :error="error?.message"
      :has-prev-page="offset > 0"
      :has-next-page="hasNextPage"
      @next="next(loading, hasNextPage && !error)"
      @previous="previous(loading)"
      @retry="refetch()"
    />
  </div>
</template>

<script setup lang="ts">
import { GetAddressNFTs } from "@/module/chaingraph";
import NFTGallery, { type ChildNftItem } from "~/components/token/NFTGallery.vue";
import { formatLockingBytecodeAddress } from "~/hooks/addressDisplay";
import { useAuthChains } from "~/hooks/authchains";
import { nftPage, useNftPagination } from "~/hooks/nftPagination";
import { useRegistryStore, useStateStore } from "~/store";
import type { tableColumn } from "~/types/index.js";

const viewModes = ["table", "grid"] as const;
const viewMode = ref<(typeof viewModes)[number]>("table");
const props = defineProps<{
	lockingBytecode: string;
}>();
const stateStore = useStateStore();
const registryStore = useRegistryStore();
const { offset, pageSize, limit, next, previous } = useNftPagination(
	() => `${stateStore.network}:${props.lockingBytecode}`,
	() => viewMode.value,
);
const variables = computed(() => ({
	network: stateStore.network,
	lockingBytecode: `{${props.lockingBytecode}}`,
	offset: offset.value,
	limit: limit.value,
}));

const {
	result: transaction,
	error,
	loading,
	refetch,
} = useQuery(GetAddressNFTs, variables);
const page = computed(() =>
	nftPage(transaction.value?.search_output || [], pageSize.value),
);
const hasNextPage = computed(() => page.value.hasNextPage);
const nfts = computed<ChildNftItem[]>(() =>
	page.value.items.flatMap((output) => {
		if (!output.token_category || !output.nonfungible_token_capability) return [];

		return [{
			id: `${output.transaction_hash.substring(2)}:${output.output_index}`,
			category: output.token_category.substring(2),
			capability: output.nonfungible_token_capability,
			commitment: output.nonfungible_token_commitment?.substring(2) || "",
			address: formatLockingBytecodeAddress(props.lockingBytecode, { tokenCategory: output.token_category }),
		}];
	}),
);

useAuthChains(
	toRef(
		() =>
			transaction.value?.search_output
				.map((nft) => nft.token_category)
				.filter(Boolean) || [],
	),
);
const transactions = computed(() => {
	if (!transaction.value) {
		return [];
	}
	const items: tableColumn[][] = page.value.items.map((nft) => {
		const category = nft.token_category?.substring(2) || "";
		const commitment = nft.nonfungible_token_commitment?.substring(2) || "";

		// BCMR Data
		const metadata = registryStore.getToken(
			category,
			nft.nonfungible_token_capability || undefined,
			commitment,
		);

		return [
			{
				text: metadata?.loading
					? "Loading..."
					: metadata?.token?.name || "No name",
				token: {
					category: category,
					commitment: commitment,
					capability: nft.nonfungible_token_capability || undefined,
				},
				url: `/token/${category}`,
			},
			{
				text: category,
				short: true,
				copy: true,
				url: `/token/${category}`,
			},
			{
				text: nft.nonfungible_token_capability || "N/A",
			},
			{
				text: commitment || "N/A",
			},
		];
	});

	return items;
});
</script>
