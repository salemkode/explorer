import type { bytea } from "~/types";

export const GetUseNonBurnTokens = gql(`
  query GetUseNonBurnTokens($tokenCategory: bytea, $offset: Int, $limit: Int) {
      output(
        offset: $offset
        limit: $limit
        where: {
          token_category: { _eq: $tokenCategory }
          _not: { spent_by: {} }
        }
      ) {
        locking_bytecode
        fungible_token_amount
      }
    }
`);

export const useNonBurnTokens = (tokenCategory: bytea) => {
  const nonBurnTokens = ref(0);
  const variables = reactive({
    offset: 0,
    tokenCategory,
  });

  const { loading, onResult } = useQuery(GetUseNonBurnTokens, variables);

  onResult((response) => {
    const length = response?.data?.output.length;
    variables.offset += length === 5000 ? 5000 : 0;
    nonBurnTokens.value += response?.data?.output.reduce(
      (total, output) => total + parseInt(output.fungible_token_amount || "0"),
      0
    ) || 0;
  });

  return { loading, nonBurnTokens };
};
