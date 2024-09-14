import type { bytea } from "~/types";

export const GetMintingToken = gql(`
  query GetMintingToken($tokenCategory: bytea) {
    output(
      limit: 1
      where: {
        token_category: { _eq: $tokenCategory }
        _and: { nonfungible_token_capability: { _eq: "minting" } }
        _not: { spent_by: {} }
      }
    ) {
      locking_bytecode
    }
  }
`);

export const useIsActiveMinting = (tokenCategory: bytea) => {
	const { loading, result } = useQuery(GetMintingToken, {
		tokenCategory: tokenCategory,
	});

	// Check if there is an active minting token
	// If there is, then the minting token is active
	const isActiveMinting = computed(() => result.value?.output.length !== 0);
	return { loading, isActiveMinting };
};
