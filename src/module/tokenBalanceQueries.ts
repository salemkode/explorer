export const GetTokenBalanceBlock = gql(`
  query GetTokenBalanceBlock($network: String!, $height: bigint_comparison_exp!, $node: Int_comparison_exp!) {
    block(
      limit: 1
      order_by: { height: desc }
      where: {
        height: $height
        accepted_by: { node_internal_id: $node, node: { name: { _regex: $network } } }
      }
    ) {
      hash
      height
      accepted_by(where: { node_internal_id: $node, node: { name: { _regex: $network } } }, order_by: { node_internal_id: asc }, limit: 1) { node_internal_id }
    }
  }
`);

export const GetTokenBalanceOutputs = gql(`
  query GetTokenBalanceOutputs($where: output_bool_exp!, $limit: Int!) {
    output(
      limit: $limit
      order_by: [{ transaction_hash: asc }, { output_index: asc }]
      where: $where
    ) {
      transaction_hash
      output_index
      token_category
      locking_bytecode
      fungible_token_amount
      nonfungible_token_capability
    }
  }
`);
