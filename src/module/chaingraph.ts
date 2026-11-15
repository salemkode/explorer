export const GetTx = gql(`
  query GetTx($network: String, $hash: bytea) {
    transaction(
      where: {
        block_inclusions: {
          block: { accepted_by: { node: { name: { _regex: $network } } } }
        }
        hash: { _eq: $hash }
      }
    ) {
      hash
      input_value_satoshis
      output_value_satoshis
      is_coinbase
      block_inclusions {
        block {
          hash
          timestamp
        }
      }
      inputs {
        unlocking_bytecode
        value_satoshis
        outpoint {
          token_category
          fungible_token_amount
          nonfungible_token_commitment
          nonfungible_token_capability
          locking_bytecode
          value_satoshis
        }
      }
      outputs {
        token_category
        fungible_token_amount
        nonfungible_token_commitment
        nonfungible_token_capability
        locking_bytecode
        value_satoshis
      }
      block_inclusions {
        block {
          height
        }
      }
    }
    node(where: { name: { _regex: $network } }) {
      accepted_blocks(limit: 1, order_by: { block: { height: desc } }) {
        block {
          hash
          timestamp
          height
        }
      }
      unconfirmed_transactions(
        where: { transaction: { hash: { _eq: $hash } } }
        order_by: { validated_at: desc }
      ) {
        transaction {
          hash
          input_value_satoshis
          output_value_satoshis
          is_coinbase
          block_inclusions {
            block {
              hash
              timestamp
            }
          }
          inputs {
            unlocking_bytecode
            value_satoshis
            outpoint {
              token_category
              fungible_token_amount
              nonfungible_token_commitment
              nonfungible_token_capability
              locking_bytecode
              value_satoshis
            }
          }
          outputs {
            token_category
            fungible_token_amount
            nonfungible_token_commitment
            nonfungible_token_capability
            locking_bytecode
            value_satoshis
          }
          block_inclusions {
            block {
              height
            }
          }
        }
      }
    }
  }
`);

export const GetLastBlock = gql(`
  subscription GetLastBlock($network: String) {
    node_block(
      where: { node: { name: { _regex: $network } } }
      order_by: { block: { height: desc } }
      limit: 1
    ) {
      block {
        height
      }
    }
  }
`);

export const GetBlock = gql(`
  query GetBlock(
    $network: String
    $height: bigint
    $hash: bytea
    $limitTxs: Int
    $offsetTxs: Int
  ) {
    block(
      limit: 1
      offset: 0
      order_by: { height: desc }
      where: {
        accepted_by: { node: { name: { _regex: $network } } }
        _or: [{ height: { _eq: $height } }, { hash: { _eq: $hash } }]
      }
    ) {
      height
      hash
      transaction_count
      input_count
      input_value_satoshis
      output_count
      output_value_satoshis
      fee_satoshis
      generated_value_satoshis
      transactions(
        limit: $limitTxs
        offset: $offsetTxs
        order_by: { transaction_index: asc }
      ) {
        transaction {
          hash
          input_value_satoshis
          output_value_satoshis
          is_coinbase
          inputs {
            outpoint {
              token_category
              fungible_token_amount
              nonfungible_token_capability
              nonfungible_token_commitment
              locking_bytecode
              value_satoshis
            }
          }
          outputs {
            token_category
            fungible_token_amount
            nonfungible_token_capability
            nonfungible_token_commitment
            locking_bytecode
            value_satoshis
          }
        }
      }
    }
  }
`);

export const GetBlocks = gql(`
  subscription GetBlocks($limit: Int, $offset: Int, $network: String) {
    block(
      where: { accepted_by: { node: { name: { _regex: $network } } } }
      order_by: { height: desc }
      limit: $limit
      offset: $offset
    ) {
      hash
      height
      transaction_count
      input_count
      output_count
      output_value_satoshis
      size_bytes
      generated_value_satoshis
      timestamp
    }
  }
`);

export const MonitorMempools = gql(`
  subscription MonitorMempools($limit: Int, $offset: Int, $network: String) {
    node(where: { name: { _regex: $network } }) {
      name
      user_agent
      unconfirmed_transaction_count
      unconfirmed_transactions(
        limit: $limit
        offset: $offset
        order_by: { validated_at: desc }
      ) {
        validated_at
        transaction {
          hash
          input_value_satoshis
          output_value_satoshis
          is_coinbase
          inputs {
            outpoint {
              token_category
              fungible_token_amount
              nonfungible_token_capability
              nonfungible_token_commitment
              locking_bytecode
              value_satoshis
            }
          }
          outputs {
            token_category
            fungible_token_amount
            nonfungible_token_capability
            nonfungible_token_commitment
            locking_bytecode
            value_satoshis
          }
        }
      }
    }
  }
`);

export const GetTransactions = gql(`
  query GetTransactions($network: String, $hashes: [bytea!]) {
    transaction(
      where: {
        block_inclusions: {
          block: { accepted_by: { node: { name: { _regex: $network } } } }
        }
        hash: { _in: $hashes }
      }
    ) {
      hash
      input_value_satoshis
      output_value_satoshis
      is_coinbase
      inputs {
        outpoint {
          token_category
          fungible_token_amount
          nonfungible_token_capability
          nonfungible_token_commitment
          locking_bytecode
          value_satoshis
        }
      }
      outputs {
        token_category
        fungible_token_amount
        nonfungible_token_capability
        nonfungible_token_commitment
        locking_bytecode
        value_satoshis
      }
    }
  }
`);

export const GetTokenTxs = gql(`
  query GetTokenTxs(
    $limit: Int
    $offset: Int
    $network: String
    $tokenCategory: bytea
  ) {
    block_transaction(
      limit: $limit
      offset: $offset
      order_by: { block: { height: desc } }
      where: {
        block: { accepted_by: { node: { name: { _regex: $network } } } }
        transaction: { outputs: { token_category: { _eq: $tokenCategory } } }
      }
    ) {
      block {
        height
        timestamp
      }
      transaction {
        hash
        input_value_satoshis
        output_value_satoshis
      }
    }
  }
`);

export const GetAuthChains = gql(`
  query GetAuthChains($network: String, $tokenCategory: [bytea!]) {
    transaction(
      where: {
        block_inclusions: {
          block: { accepted_by: { node: { name: { _regex: $network } } } }
        }
        hash: { _in: $tokenCategory }
      }
    ) {
      hash
      authchains {
        authchain_length
        authhead_transaction_hash
        unspent_authhead
        authhead {
          hash
          identity_output {
            fungible_token_amount
          }
        }
        migrations(order_by: { migration_index: desc }) {
          migration_index
          transaction {
            hash
            block_inclusions {
              block {
                timestamp
              }
            }
            inputs(where: { outpoint_index: { _eq: 0 } }) {
              outpoint_transaction_hash
              outpoint_index
            }
            outputs(order_by: { output_index: asc }) {
              token_category
              locking_bytecode
              fungible_token_amount
              nonfungible_token_capability
              nonfungible_token_commitment
            }
          }
        }
      }
    }
  }
`);

export const GetTokenChild = gql(`
  query GetTokenChild(
    $limit: Int
    $offset: Int
    $network: String
    $tokenCategory: bytea
  ) {
    output(
      limit: $limit
      offset: $offset
      order_by: [{ transaction_hash: asc }, { output_index: asc }]
      where: {
        transaction: {
          block_inclusions: {
            block: { accepted_by: { node: { name: { _regex: $network } } } }
          }
        }
        token_category: { _eq: $tokenCategory }
        nonfungible_token_capability: { _nin: "minting" }
        _not: { spent_by: { transaction: { hash: { _gt: "" } } } }
      }
    ) {
      transaction_hash
      output_index
      locking_bytecode
      nonfungible_token_capability
      nonfungible_token_commitment
    }
  }
`);

export const GetAddressNFTs = gql(`
  query GetAddressNFTs(
    $limit: Int
    $offset: Int
    $network: String
    $lockingBytecode: _text
  ) {
    search_output(
      limit: $limit
      offset: $offset
      order_by: [{ transaction_hash: asc }, { output_index: asc }]
      args: { locking_bytecode_hex: $lockingBytecode }
      where: {
        token_category: { _is_null: false }
        transaction: {
          block_inclusions: {
            block: { accepted_by: { node: { name: { _regex: $network } } } }
          }
        }
        nonfungible_token_capability: { _is_null: false }
        _not: { spent_by: { transaction: { hash: { _gt: "" } } } }
      }
    ) {
      transaction_hash
      output_index
      token_category
      nonfungible_token_capability
      nonfungible_token_commitment
    }
  }
`);

// Export types
export * from "~/graphql/graphql";
