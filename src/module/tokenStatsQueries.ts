/**
 * Chaingraph queries behind the token supply and holder statistics.
 *
 * An output only counts when the transaction that created it is valid (in a
 * mempool or included in a block), and it is only spent when a valid
 * transaction spends it. Chaingraph keeps transactions it once saw in a mempool
 * even after they were dropped, so without these checks dropped double-spends
 * add phantom outputs (ParyonUSD: ~3,900) or hide real ones.
 *
 * Validity uses block inclusion rather than `accepted_by`: joining the
 * accepting node makes these queries time out on busy categories (Moria USD),
 * and a category only exists on one network. Chaingraph returns at most 5000
 * rows per `output` query, so callers page with a stable ordering.
 */

export const TOKEN_STATS_PAGE_SIZE = 5000;

export const GetTokenUnspentOutputs = gql(`
  query GetTokenUnspentOutputs(
    $tokenCategory: bytea
    $offset: Int
  ) {
    output(
      offset: $offset
      limit: 5000
      order_by: [{ transaction_hash: asc }, { output_index: asc }]
      where: {
        token_category: { _eq: $tokenCategory }
        locking_bytecode_pattern: { _neq: "6a" }
        transaction: {
          _or: [
            { node_validations: {} }
            { block_inclusions: {} }
          ]
        }
        _not: {
          spent_by: {
            transaction: {
              _or: [
                { node_validations: {} }
                { block_inclusions: {} }
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
    }
  }
`);

/**
 * Unspent minting/mutable NFT outputs (they hold the reserved supply). Small
 * and fast, so reserve figures show before the full holder scan finishes, or
 * when it times out.
 */
export const GetTokenIssuingOutputs = gql(`
  query GetTokenIssuingOutputs($tokenCategory: bytea) {
    output(
      where: {
        token_category: { _eq: $tokenCategory }
        nonfungible_token_capability: { _in: ["minting", "mutable"] }
        locking_bytecode_pattern: { _neq: "6a" }
        transaction: {
          _or: [{ node_validations: {} }, { block_inclusions: {} }]
        }
        _not: {
          spent_by: {
            transaction: {
              _or: [{ node_validations: {} }, { block_inclusions: {} }]
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
    }
  }
`);

/**
 * Token outputs locked by OP_RETURN (unspendable). Validity is checked client
 * side: filtering on accepted_by makes this query time out on large categories.
 */
export const GetTokenOpReturnOutputs = gql(`
  query GetTokenOpReturnOutputs($tokenCategory: bytea, $offset: Int) {
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
        node_validations(limit: 1) {
          validated_at
        }
        block_inclusions {
          block {
            timestamp
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
        node_validations(limit: 1) {
          validated_at
        }
        block_inclusions {
          block {
            timestamp
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
