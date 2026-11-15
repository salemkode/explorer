import { computed, type MaybeRefOrGetter, toValue } from "vue";
import type { bytea } from "~/types";
import { useConfirmedNode } from "./confirmedNode";
import { useScopedQuery } from "./scopedQuery";

export const GetMintingToken = gql(`
  query GetMintingToken($tokenCategory: bytea, $node: Int!) {
    output(
      limit: 1
      where: {
        token_category: { _eq: $tokenCategory }
        transaction: { block_inclusions: { block: { accepted_by: { node_internal_id: { _eq: $node } } } } }
        _and: { nonfungible_token_capability: { _eq: "minting" } }
        _not: { spent_by: { transaction: { block_inclusions: { block: { accepted_by: { node_internal_id: { _eq: $node } } } } } } }
      }
    ) {
      locking_bytecode
    }
  }
`);

export const useIsActiveMinting = (tokenCategory: MaybeRefOrGetter<bytea>) => {
	const confirmed = useConfirmedNode();
	const { loading, result, error } = useScopedQuery(GetMintingToken, () => ({
		tokenCategory: toValue(tokenCategory),
		node: confirmed.node.value,
	}));

	// Check if there is an active minting token
	// If there is, then the minting token is active
	const isActiveMinting = computed(
		() => (result.value?.output.length || 0) > 0,
	);
	return {
		loading: computed(() => loading.value || confirmed.loading.value),
		error: computed(() => error.value || confirmed.error.value),
		isActiveMinting,
	};
};
