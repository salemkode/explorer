import type { GetMintingTokenQuery } from "~/graphql/graphql";
import type { bytea } from "~/types";

export const GetMintingToken = gql`
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
`;

export const useIsActiveMinting = (tokenCategory: bytea) => {
  const { loading, result } = useQuery<GetMintingTokenQuery>(GetMintingToken, {
    tokenCategory,
  });

  const isActiveMinting = computed(() => result.value?.output.length !== 0);
  return { loading, isActiveMinting };
};
