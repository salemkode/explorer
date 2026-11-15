export const GetCashTokenActivity = gql(`
  query GetCashTokenActivity($network: String!, $blocks: Int!, $transactions: Int!, $outputs: Int!) {
    block(
      where: { accepted_by: { node: { name: { _regex: $network } } } }
      order_by: [{ height: desc }, { hash: asc }]
      limit: $blocks
    ) {
      hash
      height
      timestamp
      transactions(
        where: { transaction: { outputs: { token_category: { _is_null: false } } } }
        order_by: { transaction_index: desc }
        limit: $transactions
      ) {
        transaction {
          hash
          outputs(
            where: { token_category: { _is_null: false } }
            order_by: { output_index: asc }
            limit: $outputs
          ) {
            output_index
            token_category
            fungible_token_amount
            nonfungible_token_capability
          }
        }
      }
    }
  }
`);
