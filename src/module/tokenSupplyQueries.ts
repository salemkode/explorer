// Pin one node and accepted block before scanning; never mix mempools or nodes.
export const GetSupplySnapshot = gql(`
  query GetSupplySnapshot($network: String!) {
    node(where: { name: { _regex: $network } }, order_by: { internal_id: asc }, limit: 1) {
      internal_id
      name
      accepted_blocks(order_by: { block: { height: desc } }, limit: 1) {
        block { hash height }
      }
    }
  }
`);

export const GetSupplyTransactions = gql(`
  query GetSupplyTransactions($category: bytea!, $node: Int!, $height: bigint!, $cursor: bigint!, $limit: Int!) {
    transaction(
      order_by: { internal_id: asc }
      limit: $limit
      where: {
        internal_id: { _gt: $cursor }
        block_inclusions: { block: {
          height: { _lte: $height }
          accepted_by: { node_internal_id: { _eq: $node } }
        } }
        _or: [
          { outputs: { token_category: { _eq: $category } } }
          { inputs: { outpoint: { token_category: { _eq: $category } } } }
        ]
      }
    ) {
      internal_id
      hash
      input_count
      output_count
      inputs(order_by: { input_index: asc }, limit: 5000) {
        input_index
        outpoint_index
        outpoint_transaction_hash
        outpoint { token_category fungible_token_amount }
      }
      outputs(order_by: { output_index: asc }, limit: 5000) {
        output_index
        token_category
        fungible_token_amount
        locking_bytecode
      }
    }
  }
`);

export const VerifySupplySnapshot = gql(`
  query VerifySupplySnapshot($node: Int!, $hash: bytea!) {
    node_block(where: { node_internal_id: { _eq: $node }, block: { hash: { _eq: $hash } } }, limit: 1) {
      block { hash }
    }
  }
`);

// A reserve is the unspent category balance of the BCMR authhead's output 0,
// not every issuer-controlled address. Scope both its creation and spends.
export const GetSupplyReserve = gql(`
  query GetSupplyReserve($head: bytea!, $node: Int!, $height: bigint!) {
    transaction(where: {
      hash: { _eq: $head }
      block_inclusions: { block: {
        height: { _lte: $height }
        accepted_by: { node_internal_id: { _eq: $node } }
      } }
    }, limit: 1) {
      outputs(where: { output_index: { _eq: 0 } }, limit: 1) {
        token_category
        fungible_token_amount
        locking_bytecode
        spent_by(where: { transaction: { block_inclusions: { block: {
          height: { _lte: $height }
          accepted_by: { node_internal_id: { _eq: $node } }
        } } } }, limit: 1) { input_index }
      }
    }
  }
`);

export const GetSupplyAuthhead = gql(`
  query GetSupplyAuthhead($category: bytea!, $node: Int!, $height: bigint!) {
    transaction(where: {
      hash: { _eq: $category }
      block_inclusions: { block: {
        height: { _lte: $height }
        accepted_by: { node_internal_id: { _eq: $node } }
      } }
    }, limit: 1) {
      authchains { authhead { hash } }
    }
  }
`);
