import { computed } from "vue";
import { useStateStore } from "~/store";
import { useScopedQuery } from "./scopedQuery";
export const GetAccountingNode = gql(`
  query GetAccountingNode($network: String!) {
    node(where: { name: { _regex: $network } }, order_by: { internal_id: asc }, limit: 1) { internal_id }
  }
`);
export function useConfirmedNode() {
	const store = useStateStore();
	const query = useScopedQuery(GetAccountingNode, () => ({
		network: store.network,
	}));
	return {
		...query,
		node: computed(() => query.result.value?.node[0]?.internal_id ?? -1),
	};
}
