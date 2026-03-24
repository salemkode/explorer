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
    @next="offset += pageSize"
    @previous="offset -= pageSize"
  />
  <NFTGallery
    v-else
    :items="childNfts"
    :loading="loading"
    :error="error?.message"
    :has-prev-page="!!offset"
    :has-next-page="!!hasNextPage"
    @next="offset += pageSize"
    @previous="offset -= pageSize"
  />
</template>

<script setup lang="ts">
import { GetTokenChild } from "@/module/chaingraph";
import type { GetTokenChildQuery } from "@/module/chaingraph";
import { formatLockingBytecodeAddress } from "~/hooks/addressDisplay";
import { useStateStore } from "~/store";
import type { IdentitySnapshot, tableColumn } from "~/types/index.js";
import NFTGallery, { type ChildNftItem } from "./NFTGallery.vue";

const stateStore = useStateStore();
const offset = ref(0);
const props = defineProps<{
	category: string;
	identitySnapshot?: IdentitySnapshot;
	viewMode?: "table" | "grid";
}>();
const effectiveViewMode = computed(() =>
	props.viewMode === "grid" ? "grid" : "table",
);
const pageSize = computed(() => (effectiveViewMode.value === "grid" ? 24 : 8));
const limit = computed(() => pageSize.value + 1);
const variable = computed(() => ({
	network: stateStore.network,
	tokenCategory: `\\x${props.category}` as const,
	offset: offset.value,
	limit: limit.value,
}));
const { result, loading, error } = useQuery(GetTokenChild, variable);
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
const hasNextPage = computed(() => {
	if (result.value) {
		return result.value.output.length === limit.value;
	}
	return false;
});
type ChildOutput = GetTokenChildQuery["output"][number];

const childNfts = computed<ChildNftItem[]>(() => {
	if (!result.value) {
		return [];
	}

	let items = result.value.output.map((output: ChildOutput) => {
		const commitment = output.nonfungible_token_commitment?.substring(2) || "";
		const address = formatLockingBytecodeAddress(output.locking_bytecode.substring(2));

		return {
			category: props.category,
			capability: output.nonfungible_token_capability,
			commitment,
			address: typeof address === "string" ? address : undefined,
			name: types.value?.[commitment]?.name || "N/A",
		};
	});

	if (items.length === limit.value) {
		items = items.slice(0, -1);
	}

	return items;
});

watch(effectiveViewMode, () => {
	offset.value = 0;
});

const outputs = computed<tableColumn[][]>(() => {
	if (!result.value) {
		return [];
	}

	let items = result.value?.output.map((output: ChildOutput) => {
		// Convert locking bytecode to cash address
		const address = formatLockingBytecodeAddress(
			output.locking_bytecode.substring(2),
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
					commitment,
					capability: output.nonfungible_token_capability || undefined,
				},
			});
		}

		return item;
	});

	// Remove last item if it reaches the limit
	if (items.length === limit.value) {
		items = items.slice(0, -1);
	}
	return items;
});
</script>
