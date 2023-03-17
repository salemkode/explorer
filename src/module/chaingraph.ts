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
    block_transaction(
      where: {
        transaction: {
          block_inclusions: {
            block: { accepted_by: { node: { name: { _regex: $network } } } }
          }
          hash: { _eq: $hash }
        }
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
        block_inclusions {
          block {
            height
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
          input_value_satoshis
          output_value_satoshis
        }
      }
    }
  }
`;

export const GetLastBlock = gql`
  subscription GetLastBlock($network: String) {
    node_block(
      where: { node: { name: { _regex: "mainnet" } } }
      order_by: { block: { height: desc } }
      limit: 1
    ) {
      block {
        height
      }
    }
  }
`;

// Export types
export type * from "~/graphql/graphql";
