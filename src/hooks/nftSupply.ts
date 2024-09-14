import type { bytea } from "~/types";

export const GetSupplyNFTs = gql(`
  query GetSupplyNFTs($offset: Int, $tokenCategory: bytea) {
    output(
      offset: $offset
      where: {
        token_category: { _eq: $tokenCategory }
        _and: [{ nonfungible_token_capability: { _eq: "none" } }]
        _not: { spent_by: {} }
      }
    ) {
      locking_bytecode
    }
  }
`);

export const useNftSupply = (tokenCategory: bytea) => {
	const supplyNFTs = ref(0);
	const variables = reactive({
		offset: 0,
		tokenCategory,
	});

	const { loading, onResult } = useQuery(GetSupplyNFTs, variables);

	onResult((response) => {
		const length = response?.data?.output.length;
		variables.offset += length === 5000 ? 5000 : 0;
		supplyNFTs.value += length || 0;
	});

	return { loading, supplyNFTs };
};
