<template>
  <TableView
    v-if="effectiveViewMode === 'table'"
    title="NFT Child"
    :rows="outputs"
    :columns="column"
    :has-prev-page="!!offset"
    :has-next-page="!!hasNextPage"
    :loading="loading"
    :error="error?.message"
    @next="next(loading, hasNextPage && !error)"
    @previous="previous(loading)"
  />
  <NFTGallery
    v-else
    :items="childNfts"
    :identity-snapshot="identitySnapshot"
    :loading="loading"
    :error="error?.message"
    :has-prev-page="!!offset"
    :has-next-page="!!hasNextPage"
    @next="next(loading, hasNextPage && !error)"
    @previous="previous(loading)"
    @retry="refetch()"
  />
</template>

<script setup lang="ts">
import type { GetTokenChildQuery } from "@/module/chaingraph";
import { GetTokenChild } from "@/module/chaingraph";
import { formatLockingBytecodeAddress } from "~/hooks/addressDisplay";
import { nftPage, useNftPagination } from "~/hooks/nftPagination";
import { useStateStore } from "~/store";
import type { IdentitySnapshot, tableColumn } from "~/types/index.js";
import NFTGallery, { type ChildNftItem } from "./NFTGallery.vue";

const stateStore = useStateStore();
const props = defineProps<{
	category: string;
	identitySnapshot?: IdentitySnapshot | null;
	viewMode?: "table" | "grid";
}>();
const effectiveViewMode = computed(() =>
	props.viewMode === "grid" ? "grid" : "table",
);
const { offset, pageSize, limit, next, previous } = useNftPagination(
	() => `${stateStore.network}:${props.category}`,
	() => effectiveViewMode.value,
);
const variable = computed(() => ({
	network: stateStore.network,
	tokenCategory: `\\x${props.category}` as const,
	offset: offset.value,
	limit: limit.value,
}));
const { result, loading, error, refetch } = useQuery(GetTokenChild, variable);
const types = computed(() => props.identitySnapshot?.token?.nfts?.parse.types);

const showTokenColumn = computed(() => {
	return Object.keys(types.value || {}).length !== 0;
});
const column = computed(() => {
	const result = ["token", "address", "capability", "commitment"];

	// Remove token column if there is no token info
	if (!showTokenColumn.value) {
		result.shift();
	}
	return result;
});
const page = computed(() => nftPage(result.value?.output || [], pageSize.value));
const hasNextPage = computed(() => page.value.hasNextPage);
type ChildOutput = GetTokenChildQuery["output"][number];

const childNfts = computed<ChildNftItem[]>(() =>
	page.value.items.flatMap((output) => {
		if (!output.nonfungible_token_capability) return [];

		const commitment = output.nonfungible_token_commitment?.substring(2) || "";
		const address = formatLockingBytecodeAddress(
			output.locking_bytecode.substring(2),
			{ tokenCategory: `\\x${props.category}` },
		);


		return [{
			id: `${output.transaction_hash.substring(2)}:${output.output_index}`,
			category: props.category,
			capability: output.nonfungible_token_capability,
			commitment,
			address,
		}];
	}),
);

const outputs = computed<tableColumn[][]>(() => {
	if (!result.value) {
		return [];
	}

	const items = page.value.items.map((output: ChildOutput) => {
		// Convert locking bytecode to cash address
		const address = formatLockingBytecodeAddress(
			output.locking_bytecode.substring(2),
			{ tokenCategory: `\\x${props.category}` },
		);
		// Get nonfungible token commitment
		const commitment = output.nonfungible_token_commitment?.substring(2);
		const item: tableColumn[] = [
			{
				text: output.nonfungible_token_capability?.toString() || "N/A",
			},
			{
				text: commitment || "N/A",
			},
		];

		// Add address column
		if (typeof address === "string") {
			item.unshift({
				text: address,
				copy: true,
				short: true,
				url: `/address/${address}`,
			});
		} else {
			item.unshift({
				text: "N/A",
			});
		}

		// Add child info column
		if (showTokenColumn.value && typeof commitment === "string") {
			item.unshift({
				text: types.value?.[commitment]?.name || "N/A",
				token: {
					category: props.category,
					identitySnapshot: props.identitySnapshot || null,
					commitment,
					capability: output.nonfungible_token_capability || undefined,
				},
			});
		}

		return item;
	});

	return items;
});
</script>
