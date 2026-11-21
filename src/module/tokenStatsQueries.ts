/**
 * Chaingraph queries behind the token supply and holder statistics.
 *
 * An output only counts while the selected network has the transaction that
 * created it: in a network node's mempool, or in a block a network node
 * currently accepts. It is spent only by such a transaction. Chaingraph keeps
 * transactions it once saw in a mempool even after they were dropped (about
 * 3,900 phantom ParyonUSD outputs), and a reorganization removes a block's
 * acceptance but keeps its transactions' block inclusions, so neither mempool
 * history nor block inclusion alone is enough.
 *
 * Spends are filtered server side by acceptance. Filtering the creating
 * transaction the same way times out on busy categories (Moria USD), so those
 * queries only prefilter it cheaply and select its acceptance by `$nodes` for
 * `isAcceptedTransaction`. `$nodes` are the selected network's node ids
 * (`GetNetworkNodes`). Chaingraph returns at most 5000 rows per `output`
 * query, so callers page with a stable ordering.
 */

/** Chaingraph's node ids for the selected network ("mainnet", "chipnet"). */
export const GetNetworkNodes = gql(`
  query GetNetworkNodes($network: String) {
    node(where: { name: { _regex: $network } }) {
      internal_id
    }
  }
`);

export const TOKEN_STATS_PAGE_SIZE = 5000;

export const GetTokenUnspentOutputs = gql(`
  query GetTokenUnspentOutputs(
    $tokenCategory: bytea
    $nodes: [Int!]
    $offset: Int
  ) {
    output(
      offset: $offset
      limit: 5000
      order_by: [{ transaction_hash: asc }, { output_index: asc }]
      where: {
        token_category: { _eq: $tokenCategory }
        locking_bytecode_pattern: { _neq: "6a" }
        # Cheap prefilter; acceptance of the creating transaction is checked
        # client side from the selected fields (isAcceptedTransaction).
        transaction: {
          _or: [{ node_validations: {} }, { block_inclusions: {} }]
        }
        _not: {
          spent_by: {
            transaction: {
              _or: [
                { node_validations: { node_internal_id: { _in: $nodes } } }
                {
                  block_inclusions: {
                    block: { accepted_by: { node_internal_id: { _in: $nodes } } }
                  }
                }
              ]
            }
          }
        }
      }
    ) {
      transaction_hash
      output_index
      locking_bytecode
      fungible_token_amount
      nonfungible_token_capability
      nonfungible_token_commitment
      transaction {
        node_validations(limit: 1, where: { node_internal_id: { _in: $nodes } }) {
          validated_at
        }
        block_inclusions {
          block {
            accepted_by(limit: 1, where: { node_internal_id: { _in: $nodes } }) {
              node_internal_id
            }
          }
        }
      }
    }
  }
`);

/**
 * Unspent minting/mutable NFT outputs (they hold the reserved supply). Small
 * and fast, so reserve figures show before the full holder scan finishes. One
 * unordered page: a full page means the set may be incomplete, and the reserve
 * then waits for the holder scan.
 */
export const GetTokenIssuingOutputs = gql(`
  query GetTokenIssuingOutputs($tokenCategory: bytea, $nodes: [Int!]) {
    output(
      limit: 5000
      where: {
        token_category: { _eq: $tokenCategory }
        nonfungible_token_capability: { _in: ["minting", "mutable"] }
        locking_bytecode_pattern: { _neq: "6a" }
        # Cheap prefilter; acceptance of the creating transaction is checked
        # client side from the selected fields (isAcceptedTransaction).
        transaction: {
          _or: [{ node_validations: {} }, { block_inclusions: {} }]
        }
        _not: {
          spent_by: {
            transaction: {
              _or: [
                { node_validations: { node_internal_id: { _in: $nodes } } }
                {
                  block_inclusions: {
                    block: { accepted_by: { node_internal_id: { _in: $nodes } } }
                  }
                }
              ]
            }
          }
        }
      }
    ) {
      transaction_hash
      output_index
      locking_bytecode
      fungible_token_amount
      nonfungible_token_capability
      transaction {
        node_validations(limit: 1, where: { node_internal_id: { _in: $nodes } }) {
          validated_at
        }
        block_inclusions {
          block {
            accepted_by(limit: 1, where: { node_internal_id: { _in: $nodes } }) {
              node_internal_id
            }
          }
        }
      }
    }
  }
`);

/**
 * Token outputs locked by OP_RETURN (unspendable). Acceptance is checked client
 * side: filtering on it makes this query time out on large categories.
 */
export const GetTokenOpReturnOutputs = gql(`
  query GetTokenOpReturnOutputs(
    $tokenCategory: bytea
    $nodes: [Int!]
    $offset: Int
  ) {
    output(
      offset: $offset
      limit: 5000
      order_by: [{ transaction_hash: asc }, { output_index: asc }]
      where: {
        token_category: { _eq: $tokenCategory }
        locking_bytecode_pattern: { _like: "6a%" }
      }
    ) {
      transaction_hash
      output_index
      locking_bytecode
      fungible_token_amount
      nonfungible_token_capability
      transaction {
        node_validations(limit: 1, where: { node_internal_id: { _in: $nodes } }) {
          validated_at
        }
        block_inclusions {
          block {
            accepted_by(limit: 1, where: { node_internal_id: { _in: $nodes } }) {
              node_internal_id
            }
          }
        }
      }
    }
  }
`);

/** Every output of the category ever sent to the tokenburner.cash contract. */
export const GetTokenBurnerOutputs = gql(`
  query GetTokenBurnerOutputs(
    $tokenCategory: bytea
    $lockingBytecode: bytea
    $nodes: [Int!]
    $offset: Int
  ) {
    output(
      offset: $offset
      limit: 5000
      order_by: [{ transaction_hash: asc }, { output_index: asc }]
      where: {
        token_category: { _eq: $tokenCategory }
        locking_bytecode: { _eq: $lockingBytecode }
      }
    ) {
      transaction_hash
      output_index
      locking_bytecode
      fungible_token_amount
      nonfungible_token_capability
      transaction {
        node_validations(limit: 1, where: { node_internal_id: { _in: $nodes } }) {
          validated_at
        }
        block_inclusions {
          block {
            accepted_by(limit: 1, where: { node_internal_id: { _in: $nodes } }) {
              node_internal_id
            }
          }
        }
      }
    }
  }
`);

/**
 * Unspent token outputs locked by one address (for its token balances).
 * `search_output` is the indexed lookup; filtering `output` on
 * `locking_bytecode` directly times out. `$lockingBytecode` is `{<hex>}`.
 */
export const GetAddressTokenOutputs = gql(`
  query GetAddressTokenOutputs(
    $network: String
    $lockingBytecode: _text
    $offset: Int
  ) {
    search_output(
      offset: $offset
      limit: 5000
      order_by: [{ transaction_hash: asc }, { output_index: asc }]
      args: { locking_bytecode_hex: $lockingBytecode }
      where: {
        token_category: { _is_null: false }
        transaction: {
          _or: [
            { node_validations: { node: { name: { _regex: $network } } } }
            {
              block_inclusions: {
                block: { accepted_by: { node: { name: { _regex: $network } } } }
              }
            }
          ]
        }
        _not: {
          spent_by: {
            transaction: {
              _or: [
                { node_validations: { node: { name: { _regex: $network } } } }
                {
                  block_inclusions: {
                    block: {
                      accepted_by: { node: { name: { _regex: $network } } }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ) {
      transaction_hash
      output_index
      token_category
      fungible_token_amount
      nonfungible_token_capability
    }
  }
`);
