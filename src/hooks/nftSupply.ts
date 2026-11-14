import { computed, type MaybeRefOrGetter, ref, toValue, watch } from "vue";
import { useStateStore } from "~/store";
import type { bytea } from "~/types";
import { useConfirmedNode } from "./confirmedNode";
import { useScopedQuery } from "./scopedQuery";

export const GetSupplyNFTs = gql(`
  query GetSupplyNFTs($offset: Int, $tokenCategory: bytea, $limit: Int, $node: Int!) {
    output(
      offset: $offset
      limit: $limit
      order_by: [{ transaction_hash: asc }, { output_index: asc }]
      where: {
        token_category: { _eq: $tokenCategory }
        transaction: { block_inclusions: { block: { accepted_by: { node_internal_id: { _eq: $node } } } } }
        _and: [{ nonfungible_token_capability: { _eq: "none" } }]
        _not: { spent_by: { transaction: { block_inclusions: { block: { accepted_by: { node_internal_id: { _eq: $node } } } } } } }
      }
    ) {
      locking_bytecode
    }
  }
`);

export const useNftSupply = (tokenCategory: MaybeRefOrGetter<bytea>) => {
	const stateStore = useStateStore();
	const confirmed = useConfirmedNode();
	const offset = ref(0);
	const pages = ref(new Map<number, number>());
	watch(
		() => [toValue(tokenCategory), stateStore.network],
		() => {
			offset.value = 0;
			pages.value.clear();
		},
		{ flush: "sync" },
	);
	const { loading, result, error } = useScopedQuery(GetSupplyNFTs, () => ({
		offset: offset.value,
		limit: 5000,
		tokenCategory: toValue(tokenCategory),
		node: confirmed.node.value,
	}));

	watch(
		result,
		(data) => {
			if (!data) return;
			pages.value.set(offset.value, data.output.length);
			if (data.output.length === 5000) offset.value += 5000;
		},
		{ immediate: true },
	);
	const supplyNFTs = computed(() =>
		Array.from(pages.value.values()).reduce((total, value) => total + value, 0),
	);
	return {
		loading: computed(() => loading.value || confirmed.loading.value),
		error: computed(() => error.value || confirmed.error.value),
		supplyNFTs,
	};
};
