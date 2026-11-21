<template>
  <TableView
    v-if="effectiveViewMode === 'table'"
    title="NFT Child"
    :rows="outputs"
    :columns="column"
    :has-prev-page="!!offset"
    :has-next-page="!!hasNextPage"
    :loading="loading"
    :error="error"
    @next="next(loading, hasNextPage && !error)"
    @previous="previous(loading)"
  />
  <NFTGallery
    v-else
    :items="childNfts"
    :identity-snapshot="identitySnapshot"
    :loading="loading"
    :error="error"
    :has-prev-page="!!offset"
    :has-next-page="!!hasNextPage"
    @next="next(loading, hasNextPage && !error)"
    @previous="previous(loading)"
    @retry="emit('retry')"
  />
</template>

<script setup lang="ts">
import { formatLockingBytecodeAddress } from "~/hooks/addressDisplay";
import { nftPage, useNftPagination } from "~/hooks/nftPagination";
import type { LoadState } from "~/hooks/tokenStats";
import { hexOf, isProvableBurn, type TokenOutputRow } from "~/module/tokenStats";
import { useStateStore } from "~/store";
import type { IdentitySnapshot, tableColumn } from "~/types/index.js";
import NFTGallery, { type ChildNftItem } from "./NFTGallery.vue";

const stateStore = useStateStore();
const props = defineProps<{
	category: string;
	identitySnapshot?: IdentitySnapshot | null;
	viewMode?: "table" | "grid";
	/** The token page's complete unspent-output snapshot. */
	outputs: LoadState<TokenOutputRow[]>;
}>();
const emit = defineEmits<{ retry: [] }>();
const effectiveViewMode = computed(() =>
	props.viewMode === "grid" ? "grid" : "table",
);
const { offset, pageSize, limit, next, previous } = useNftPagination(
	() => `${stateStore.network}:${props.category}`,
	() => effectiveViewMode.value,
);
const loading = computed(() => props.outputs.status === "loading");
const error = computed(() =>
	props.outputs.status === "error" ? props.outputs.message : "",
);
/**
 * Unspent non-minting NFTs in outpoint order, paged in the browser: a paged
 * `ORDER BY` query times out on large categories (ParyonUSD).
 */
const nftOutputs = computed(() => {
	if (props.outputs.status !== "ready") return [];
	const byOutpoint = new Map<string, TokenOutputRow>();
	for (const output of props.outputs.value) {
		const capability = output.nonfungible_token_capability;
		if (!capability || capability === "minting") continue;
		if (isProvableBurn(output.locking_bytecode)) continue;
		byOutpoint.set(
			`${hexOf(output.transaction_hash)}:${Number(output.output_index)}`,
			output,
		);
	}
	return [...byOutpoint.values()].sort(
		(a, b) =>
			hexOf(a.transaction_hash).localeCompare(hexOf(b.transaction_hash)) ||
			Number(a.output_index) - Number(b.output_index),
	);
});
const result = computed(() => ({
	output: nftOutputs.value.slice(offset.value, offset.value + limit.value),
}));
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
type ChildOutput = TokenOutputRow;

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
