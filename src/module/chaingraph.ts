export const GetBlock = gql`
  query GetBlock($network: String, $height: bigint, $hash: bytea) {
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
      transaction_count
      input_count
      input_value_satoshis
      fee_satoshis
      generated_value_satoshis
    }
  }
`;

export const GetTx = gql`
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
`;

export const LastTransaction = gql`
  query LastTransaction($network: String) {
    block(
      limit: 1
      order_by: { height: desc }
      where: { accepted_by: { node: { name: { _regex: $network } } } }
    ) {
      height
      transactions(limit: 10) {
        transaction {
          hash
          input_count
          output_count
          output_value_satoshis
          input_value_satoshis
          inputs {
            outpoint {
              token_category
              fungible_token_amount
            }
          }
          outputs {
            token_category
            fungible_token_amount
          }
          size_bytes
        }
      }
    }
  }
`;

export const GetLastBlock = gql`
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
`;

export const MonitorMempools = gql`
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
          inputs {
            outpoint {
              token_category
              fungible_token_amount
            }
          }
          outputs {
            token_category
            fungible_token_amount
          }
          size_bytes
        }
      }
    }
  }
`;

export const GetTokenAddress = gql`
  query GetTokenAddress(
    $limit: Int
    $offset: Int
    $network: String
    $tokenCategory: bytea
  ) {
    output(
      limit: $limit
      offset: $offset
      order_by: { fungible_token_amount: desc_nulls_last }
      where: {
        token_category: { _eq: $tokenCategory }
        transaction: {
          block_inclusions: {
            block: { accepted_by: { node: { name: { _regex: $network } } } }
          }
        }
        _not: { spent_by: { transaction: { hash: { _gt: "" } } } }
      }
    ) {
      value_satoshis
      locking_bytecode
      transaction_hash
      output_index
      fungible_token_amount
      spent_by {
        transaction {
          hash
        }
      }
    }
  }
`;

export const GetTokenTxs = gql`
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
        is_coinbase
        inputs {
          unlocking_bytecode
          value_satoshis
          outpoint {
            fungible_token_amount
            locking_bytecode
            locking_bytecode_pattern
            nonfungible_token_capability
            nonfungible_token_commitment
            output_index
            spent_by {
              outpoint {
                fungible_token_amount
              }
              value_satoshis
            }
            token_category
          }
        }
        outputs {
          locking_bytecode
          value_satoshis
          token_category
          fungible_token_amount
        }
        block_inclusions {
          block {
            height
          }
        }
      }
    }
  }
`;

export const GetToken = gql`
  query GetToken($network: String, $tokenCategory: bytea) {
    transaction(
      where: {
        block_inclusions: {
          block: { accepted_by: { node: { name: { _regex: $network } } } }
        }
        inputs: {
          outpoint_transaction_hash: { _eq: $tokenCategory }
          outpoint_index: { _eq: 0 }
        }
      }
    ) {
      hash
      outputs {
        fungible_token_amount
        nonfungible_token_capability
        nonfungible_token_commitment
        locking_bytecode
      }
    }
  }
`;

export const GetOpreturn = gql`
  query GetOpreturn($network: String, $tokenCategory: bytea) {
    transaction(
      where: {
        block_inclusions: {
          block: { accepted_by: { node: { name: { _regex: $network } } } }
        }
        inputs: {
          outpoint_transaction_hash: { _eq: $tokenCategory }
          outpoint_index: { _eq: 0 }
        }
      }
    ) {
      hash
      outputs {
        fungible_token_amount
        nonfungible_token_capability
        nonfungible_token_commitment
        locking_bytecode
      }
    }
  }
`;

export const GetTokenChild = gql`
  query GetTokenChild($network: String, $tokenCategory: bytea) {
    output(
      where: {
        transaction: {
          block_inclusions: {
            block: { accepted_by: { node: { name: { _regex: $network } } } }
          }
        }
        token_category: { _eq: $tokenCategory }
        nonfungible_token_capability: { _eq: "none" }
      }
    ) {
      locking_bytecode
      nonfungible_token_capability
      nonfungible_token_commitment
    }
  }
`;

// Export types
export type * from "~/graphql/graphql";
