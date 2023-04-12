/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query GetBlock($network: String, $height: bigint, $hash: bytea) {\n    block(\n      limit: 1\n      offset: 0\n      order_by: { height: desc }\n      where: {\n        accepted_by: { node: { name: { _regex: $network } } }\n        _or: [{ height: { _eq: $height } }, { hash: { _eq: $hash } }]\n      }\n    ) {\n      height\n      transaction_count\n      input_count\n      input_value_satoshis\n      fee_satoshis\n      generated_value_satoshis\n    }\n  }\n": types.GetBlockDocument,
    "\n  query GetTx($network: String, $hash: bytea) {\n    transaction(\n      where: {\n        block_inclusions: {\n          block: { accepted_by: { node: { name: { _regex: $network } } } }\n        }\n        hash: { _eq: $hash }\n      }\n    ) {\n      hash\n      input_value_satoshis\n      output_value_satoshis\n      is_coinbase\n      block_inclusions {\n        block {\n          hash\n          timestamp\n        }\n      }\n      inputs {\n        unlocking_bytecode\n        value_satoshis\n        outpoint {\n          token_category\n          fungible_token_amount\n          nonfungible_token_commitment\n          nonfungible_token_capability\n          locking_bytecode\n        }\n      }\n      outputs {\n        token_category\n        fungible_token_amount\n        nonfungible_token_commitment\n        nonfungible_token_capability\n        locking_bytecode\n        value_satoshis\n      }\n      block_inclusions {\n        block {\n          height\n        }\n      }\n    }\n    node(where: { name: { _regex: $network } }) {\n      accepted_blocks(limit: 1, order_by: { block: { height: desc } }) {\n        block {\n          hash\n          timestamp\n          height\n        }\n      }\n      unconfirmed_transactions(\n        where: { transaction: { hash: { _eq: $hash } } }\n        order_by: { validated_at: desc }\n      ) {\n        transaction {\n          hash\n          input_value_satoshis\n          output_value_satoshis\n          is_coinbase\n          block_inclusions {\n            block {\n              hash\n              timestamp\n            }\n          }\n          inputs {\n            unlocking_bytecode\n            value_satoshis\n            outpoint {\n              token_category\n              fungible_token_amount\n              nonfungible_token_commitment\n              nonfungible_token_capability\n              locking_bytecode\n            }\n          }\n          outputs {\n            token_category\n            fungible_token_amount\n            nonfungible_token_commitment\n            nonfungible_token_capability\n            locking_bytecode\n            value_satoshis\n          }\n          block_inclusions {\n            block {\n              height\n            }\n          }\n        }\n      }\n    }\n  }\n": types.GetTxDocument,
    "\n  query LastTransaction($network: String) {\n    block(\n      limit: 1\n      order_by: { height: desc }\n      where: { accepted_by: { node: { name: { _regex: $network } } } }\n    ) {\n      height\n      transactions(limit: 10) {\n        transaction {\n          hash\n          input_count\n          output_count\n          output_value_satoshis\n          input_value_satoshis\n          inputs {\n            outpoint {\n              token_category\n              fungible_token_amount\n            }\n          }\n          outputs {\n            token_category\n            fungible_token_amount\n          }\n          size_bytes\n        }\n      }\n    }\n  }\n": types.LastTransactionDocument,
    "\n  subscription GetLastBlock($network: String) {\n    node_block(\n      where: { node: { name: { _regex: $network } } }\n      order_by: { block: { height: desc } }\n      limit: 1\n    ) {\n      block {\n        height\n      }\n    }\n  }\n": types.GetLastBlockDocument,
    "\n  subscription MonitorMempools($limit: Int, $offset: Int, $network: String) {\n    node(where: { name: { _regex: $network } }) {\n      name\n      user_agent\n      unconfirmed_transaction_count\n      unconfirmed_transactions(\n        limit: $limit\n        offset: $offset\n        order_by: { validated_at: desc }\n      ) {\n        validated_at\n        transaction {\n          hash\n          input_value_satoshis\n          output_value_satoshis\n          inputs {\n            outpoint {\n              token_category\n              fungible_token_amount\n            }\n          }\n          outputs {\n            token_category\n            fungible_token_amount\n          }\n          size_bytes\n        }\n      }\n    }\n  }\n": types.MonitorMempoolsDocument,
    "\n  query GetTokenAddress(\n    $limit: Int\n    $offset: Int\n    $network: String\n    $tokenCategory: bytea\n  ) {\n    output(\n      limit: $limit\n      offset: $offset\n      order_by: { fungible_token_amount: desc_nulls_last }\n      where: {\n        token_category: { _eq: $tokenCategory }\n        transaction: {\n          block_inclusions: {\n            block: { accepted_by: { node: { name: { _regex: $network } } } }\n          }\n        }\n        _not: { spent_by: { transaction: { hash: { _gt: \"\" } } } }\n      }\n    ) {\n      value_satoshis\n      locking_bytecode\n      transaction_hash\n      output_index\n      fungible_token_amount\n      spent_by {\n        transaction {\n          hash\n        }\n      }\n    }\n  }\n": types.GetTokenAddressDocument,
    "\n  query GetTokenTxs(\n    $limit: Int\n    $offset: Int\n    $network: String\n    $tokenCategory: bytea\n  ) {\n    block_transaction(\n      limit: $limit\n      offset: $offset\n      order_by: { block: { height: desc } }\n      where: {\n        block: { accepted_by: { node: { name: { _regex: $network } } } }\n        transaction: { outputs: { token_category: { _eq: $tokenCategory } } }\n      }\n    ) {\n      block {\n        height\n        timestamp\n      }\n      transaction {\n        hash\n        input_value_satoshis\n        output_value_satoshis\n      }\n    }\n  }\n": types.GetTokenTxsDocument,
    "\n  query GetToken($network: String, $tokenCategory: bytea) {\n    transaction(\n      where: {\n        block_inclusions: {\n          block: { accepted_by: { node: { name: { _regex: $network } } } }\n        }\n        inputs: {\n          outpoint_transaction_hash: { _eq: $tokenCategory }\n          outpoint_index: { _eq: 0 }\n        }\n      }\n    ) {\n      hash\n      outputs {\n        fungible_token_amount\n        nonfungible_token_capability\n        nonfungible_token_commitment\n        locking_bytecode\n      }\n    }\n  }\n": types.GetTokenDocument,
    "\n  query GetOpreturn($network: String, $tokenCategory: bytea) {\n    transaction(\n      where: {\n        block_inclusions: {\n          block: { accepted_by: { node: { name: { _regex: $network } } } }\n        }\n        inputs: {\n          outpoint_transaction_hash: { _eq: $tokenCategory }\n          outpoint_index: { _eq: 0 }\n        }\n      }\n    ) {\n      hash\n      outputs {\n        fungible_token_amount\n        nonfungible_token_capability\n        nonfungible_token_commitment\n        locking_bytecode\n      }\n    }\n  }\n": types.GetOpreturnDocument,
    "\n  query GetTokenChild(\n    $limit: Int\n    $offset: Int\n    $network: String\n    $tokenCategory: bytea\n  ) {\n    output(\n      limit: $limit\n      offset: $offset\n      where: {\n        transaction: {\n          block_inclusions: {\n            block: { accepted_by: { node: { name: { _regex: $network } } } }\n          }\n        }\n        token_category: { _eq: $tokenCategory }\n        nonfungible_token_capability: { _nin: \"minting\" }\n      }\n    ) {\n      locking_bytecode\n      nonfungible_token_capability\n      nonfungible_token_commitment\n    }\n  }\n": types.GetTokenChildDocument,
    "\n  query GetAddressNFTs(\n    $limit: Int\n    $offset: Int\n    $network: String\n    $lockingBytecode: _text\n  ) {\n    search_output(\n      limit: $limit\n      offset: $offset\n      args: { locking_bytecode_hex: $lockingBytecode }\n      where: {\n        token_category: { _is_null: false }\n        transaction: {\n          block_inclusions: {\n            block: { accepted_by: { node: { name: { _regex: $network } } } }\n          }\n        }\n        nonfungible_token_capability: { _is_null: false }\n        _not: { spent_by: { transaction: { hash: { _gt: \"\" } } } }\n      }\n    ) {\n      token_category\n      nonfungible_token_capability\n      nonfungible_token_commitment\n    }\n  }\n": types.GetAddressNfTsDocument,
    "\n  query GetAddressTokens(\n    $limit: Int\n    $offset: Int\n    $network: String\n    $lockingBytecode: _text\n  ) {\n    search_output(\n      limit: $limit\n      offset: $offset\n      args: { locking_bytecode_hex: $lockingBytecode }\n      where: {\n        token_category: { _is_null: false }\n        transaction: {\n          block_inclusions: {\n            block: { accepted_by: { node: { name: { _regex: $network } } } }\n          }\n        }\n        nonfungible_token_capability: { _is_null: true }\n        _not: { spent_by: { transaction: { hash: { _gt: \"\" } } } }\n      }\n    ) {\n      token_category\n      fungible_token_amount\n    }\n  }\n": types.GetAddressTokensDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetBlock($network: String, $height: bigint, $hash: bytea) {\n    block(\n      limit: 1\n      offset: 0\n      order_by: { height: desc }\n      where: {\n        accepted_by: { node: { name: { _regex: $network } } }\n        _or: [{ height: { _eq: $height } }, { hash: { _eq: $hash } }]\n      }\n    ) {\n      height\n      transaction_count\n      input_count\n      input_value_satoshis\n      fee_satoshis\n      generated_value_satoshis\n    }\n  }\n"): (typeof documents)["\n  query GetBlock($network: String, $height: bigint, $hash: bytea) {\n    block(\n      limit: 1\n      offset: 0\n      order_by: { height: desc }\n      where: {\n        accepted_by: { node: { name: { _regex: $network } } }\n        _or: [{ height: { _eq: $height } }, { hash: { _eq: $hash } }]\n      }\n    ) {\n      height\n      transaction_count\n      input_count\n      input_value_satoshis\n      fee_satoshis\n      generated_value_satoshis\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetTx($network: String, $hash: bytea) {\n    transaction(\n      where: {\n        block_inclusions: {\n          block: { accepted_by: { node: { name: { _regex: $network } } } }\n        }\n        hash: { _eq: $hash }\n      }\n    ) {\n      hash\n      input_value_satoshis\n      output_value_satoshis\n      is_coinbase\n      block_inclusions {\n        block {\n          hash\n          timestamp\n        }\n      }\n      inputs {\n        unlocking_bytecode\n        value_satoshis\n        outpoint {\n          token_category\n          fungible_token_amount\n          nonfungible_token_commitment\n          nonfungible_token_capability\n          locking_bytecode\n        }\n      }\n      outputs {\n        token_category\n        fungible_token_amount\n        nonfungible_token_commitment\n        nonfungible_token_capability\n        locking_bytecode\n        value_satoshis\n      }\n      block_inclusions {\n        block {\n          height\n        }\n      }\n    }\n    node(where: { name: { _regex: $network } }) {\n      accepted_blocks(limit: 1, order_by: { block: { height: desc } }) {\n        block {\n          hash\n          timestamp\n          height\n        }\n      }\n      unconfirmed_transactions(\n        where: { transaction: { hash: { _eq: $hash } } }\n        order_by: { validated_at: desc }\n      ) {\n        transaction {\n          hash\n          input_value_satoshis\n          output_value_satoshis\n          is_coinbase\n          block_inclusions {\n            block {\n              hash\n              timestamp\n            }\n          }\n          inputs {\n            unlocking_bytecode\n            value_satoshis\n            outpoint {\n              token_category\n              fungible_token_amount\n              nonfungible_token_commitment\n              nonfungible_token_capability\n              locking_bytecode\n            }\n          }\n          outputs {\n            token_category\n            fungible_token_amount\n            nonfungible_token_commitment\n            nonfungible_token_capability\n            locking_bytecode\n            value_satoshis\n          }\n          block_inclusions {\n            block {\n              height\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetTx($network: String, $hash: bytea) {\n    transaction(\n      where: {\n        block_inclusions: {\n          block: { accepted_by: { node: { name: { _regex: $network } } } }\n        }\n        hash: { _eq: $hash }\n      }\n    ) {\n      hash\n      input_value_satoshis\n      output_value_satoshis\n      is_coinbase\n      block_inclusions {\n        block {\n          hash\n          timestamp\n        }\n      }\n      inputs {\n        unlocking_bytecode\n        value_satoshis\n        outpoint {\n          token_category\n          fungible_token_amount\n          nonfungible_token_commitment\n          nonfungible_token_capability\n          locking_bytecode\n        }\n      }\n      outputs {\n        token_category\n        fungible_token_amount\n        nonfungible_token_commitment\n        nonfungible_token_capability\n        locking_bytecode\n        value_satoshis\n      }\n      block_inclusions {\n        block {\n          height\n        }\n      }\n    }\n    node(where: { name: { _regex: $network } }) {\n      accepted_blocks(limit: 1, order_by: { block: { height: desc } }) {\n        block {\n          hash\n          timestamp\n          height\n        }\n      }\n      unconfirmed_transactions(\n        where: { transaction: { hash: { _eq: $hash } } }\n        order_by: { validated_at: desc }\n      ) {\n        transaction {\n          hash\n          input_value_satoshis\n          output_value_satoshis\n          is_coinbase\n          block_inclusions {\n            block {\n              hash\n              timestamp\n            }\n          }\n          inputs {\n            unlocking_bytecode\n            value_satoshis\n            outpoint {\n              token_category\n              fungible_token_amount\n              nonfungible_token_commitment\n              nonfungible_token_capability\n              locking_bytecode\n            }\n          }\n          outputs {\n            token_category\n            fungible_token_amount\n            nonfungible_token_commitment\n            nonfungible_token_capability\n            locking_bytecode\n            value_satoshis\n          }\n          block_inclusions {\n            block {\n              height\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query LastTransaction($network: String) {\n    block(\n      limit: 1\n      order_by: { height: desc }\n      where: { accepted_by: { node: { name: { _regex: $network } } } }\n    ) {\n      height\n      transactions(limit: 10) {\n        transaction {\n          hash\n          input_count\n          output_count\n          output_value_satoshis\n          input_value_satoshis\n          inputs {\n            outpoint {\n              token_category\n              fungible_token_amount\n            }\n          }\n          outputs {\n            token_category\n            fungible_token_amount\n          }\n          size_bytes\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query LastTransaction($network: String) {\n    block(\n      limit: 1\n      order_by: { height: desc }\n      where: { accepted_by: { node: { name: { _regex: $network } } } }\n    ) {\n      height\n      transactions(limit: 10) {\n        transaction {\n          hash\n          input_count\n          output_count\n          output_value_satoshis\n          input_value_satoshis\n          inputs {\n            outpoint {\n              token_category\n              fungible_token_amount\n            }\n          }\n          outputs {\n            token_category\n            fungible_token_amount\n          }\n          size_bytes\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription GetLastBlock($network: String) {\n    node_block(\n      where: { node: { name: { _regex: $network } } }\n      order_by: { block: { height: desc } }\n      limit: 1\n    ) {\n      block {\n        height\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription GetLastBlock($network: String) {\n    node_block(\n      where: { node: { name: { _regex: $network } } }\n      order_by: { block: { height: desc } }\n      limit: 1\n    ) {\n      block {\n        height\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription MonitorMempools($limit: Int, $offset: Int, $network: String) {\n    node(where: { name: { _regex: $network } }) {\n      name\n      user_agent\n      unconfirmed_transaction_count\n      unconfirmed_transactions(\n        limit: $limit\n        offset: $offset\n        order_by: { validated_at: desc }\n      ) {\n        validated_at\n        transaction {\n          hash\n          input_value_satoshis\n          output_value_satoshis\n          inputs {\n            outpoint {\n              token_category\n              fungible_token_amount\n            }\n          }\n          outputs {\n            token_category\n            fungible_token_amount\n          }\n          size_bytes\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription MonitorMempools($limit: Int, $offset: Int, $network: String) {\n    node(where: { name: { _regex: $network } }) {\n      name\n      user_agent\n      unconfirmed_transaction_count\n      unconfirmed_transactions(\n        limit: $limit\n        offset: $offset\n        order_by: { validated_at: desc }\n      ) {\n        validated_at\n        transaction {\n          hash\n          input_value_satoshis\n          output_value_satoshis\n          inputs {\n            outpoint {\n              token_category\n              fungible_token_amount\n            }\n          }\n          outputs {\n            token_category\n            fungible_token_amount\n          }\n          size_bytes\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetTokenAddress(\n    $limit: Int\n    $offset: Int\n    $network: String\n    $tokenCategory: bytea\n  ) {\n    output(\n      limit: $limit\n      offset: $offset\n      order_by: { fungible_token_amount: desc_nulls_last }\n      where: {\n        token_category: { _eq: $tokenCategory }\n        transaction: {\n          block_inclusions: {\n            block: { accepted_by: { node: { name: { _regex: $network } } } }\n          }\n        }\n        _not: { spent_by: { transaction: { hash: { _gt: \"\" } } } }\n      }\n    ) {\n      value_satoshis\n      locking_bytecode\n      transaction_hash\n      output_index\n      fungible_token_amount\n      spent_by {\n        transaction {\n          hash\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetTokenAddress(\n    $limit: Int\n    $offset: Int\n    $network: String\n    $tokenCategory: bytea\n  ) {\n    output(\n      limit: $limit\n      offset: $offset\n      order_by: { fungible_token_amount: desc_nulls_last }\n      where: {\n        token_category: { _eq: $tokenCategory }\n        transaction: {\n          block_inclusions: {\n            block: { accepted_by: { node: { name: { _regex: $network } } } }\n          }\n        }\n        _not: { spent_by: { transaction: { hash: { _gt: \"\" } } } }\n      }\n    ) {\n      value_satoshis\n      locking_bytecode\n      transaction_hash\n      output_index\n      fungible_token_amount\n      spent_by {\n        transaction {\n          hash\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetTokenTxs(\n    $limit: Int\n    $offset: Int\n    $network: String\n    $tokenCategory: bytea\n  ) {\n    block_transaction(\n      limit: $limit\n      offset: $offset\n      order_by: { block: { height: desc } }\n      where: {\n        block: { accepted_by: { node: { name: { _regex: $network } } } }\n        transaction: { outputs: { token_category: { _eq: $tokenCategory } } }\n      }\n    ) {\n      block {\n        height\n        timestamp\n      }\n      transaction {\n        hash\n        input_value_satoshis\n        output_value_satoshis\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetTokenTxs(\n    $limit: Int\n    $offset: Int\n    $network: String\n    $tokenCategory: bytea\n  ) {\n    block_transaction(\n      limit: $limit\n      offset: $offset\n      order_by: { block: { height: desc } }\n      where: {\n        block: { accepted_by: { node: { name: { _regex: $network } } } }\n        transaction: { outputs: { token_category: { _eq: $tokenCategory } } }\n      }\n    ) {\n      block {\n        height\n        timestamp\n      }\n      transaction {\n        hash\n        input_value_satoshis\n        output_value_satoshis\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetToken($network: String, $tokenCategory: bytea) {\n    transaction(\n      where: {\n        block_inclusions: {\n          block: { accepted_by: { node: { name: { _regex: $network } } } }\n        }\n        inputs: {\n          outpoint_transaction_hash: { _eq: $tokenCategory }\n          outpoint_index: { _eq: 0 }\n        }\n      }\n    ) {\n      hash\n      outputs {\n        fungible_token_amount\n        nonfungible_token_capability\n        nonfungible_token_commitment\n        locking_bytecode\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetToken($network: String, $tokenCategory: bytea) {\n    transaction(\n      where: {\n        block_inclusions: {\n          block: { accepted_by: { node: { name: { _regex: $network } } } }\n        }\n        inputs: {\n          outpoint_transaction_hash: { _eq: $tokenCategory }\n          outpoint_index: { _eq: 0 }\n        }\n      }\n    ) {\n      hash\n      outputs {\n        fungible_token_amount\n        nonfungible_token_capability\n        nonfungible_token_commitment\n        locking_bytecode\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetOpreturn($network: String, $tokenCategory: bytea) {\n    transaction(\n      where: {\n        block_inclusions: {\n          block: { accepted_by: { node: { name: { _regex: $network } } } }\n        }\n        inputs: {\n          outpoint_transaction_hash: { _eq: $tokenCategory }\n          outpoint_index: { _eq: 0 }\n        }\n      }\n    ) {\n      hash\n      outputs {\n        fungible_token_amount\n        nonfungible_token_capability\n        nonfungible_token_commitment\n        locking_bytecode\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetOpreturn($network: String, $tokenCategory: bytea) {\n    transaction(\n      where: {\n        block_inclusions: {\n          block: { accepted_by: { node: { name: { _regex: $network } } } }\n        }\n        inputs: {\n          outpoint_transaction_hash: { _eq: $tokenCategory }\n          outpoint_index: { _eq: 0 }\n        }\n      }\n    ) {\n      hash\n      outputs {\n        fungible_token_amount\n        nonfungible_token_capability\n        nonfungible_token_commitment\n        locking_bytecode\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetTokenChild(\n    $limit: Int\n    $offset: Int\n    $network: String\n    $tokenCategory: bytea\n  ) {\n    output(\n      limit: $limit\n      offset: $offset\n      where: {\n        transaction: {\n          block_inclusions: {\n            block: { accepted_by: { node: { name: { _regex: $network } } } }\n          }\n        }\n        token_category: { _eq: $tokenCategory }\n        nonfungible_token_capability: { _nin: \"minting\" }\n      }\n    ) {\n      locking_bytecode\n      nonfungible_token_capability\n      nonfungible_token_commitment\n    }\n  }\n"): (typeof documents)["\n  query GetTokenChild(\n    $limit: Int\n    $offset: Int\n    $network: String\n    $tokenCategory: bytea\n  ) {\n    output(\n      limit: $limit\n      offset: $offset\n      where: {\n        transaction: {\n          block_inclusions: {\n            block: { accepted_by: { node: { name: { _regex: $network } } } }\n          }\n        }\n        token_category: { _eq: $tokenCategory }\n        nonfungible_token_capability: { _nin: \"minting\" }\n      }\n    ) {\n      locking_bytecode\n      nonfungible_token_capability\n      nonfungible_token_commitment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetAddressNFTs(\n    $limit: Int\n    $offset: Int\n    $network: String\n    $lockingBytecode: _text\n  ) {\n    search_output(\n      limit: $limit\n      offset: $offset\n      args: { locking_bytecode_hex: $lockingBytecode }\n      where: {\n        token_category: { _is_null: false }\n        transaction: {\n          block_inclusions: {\n            block: { accepted_by: { node: { name: { _regex: $network } } } }\n          }\n        }\n        nonfungible_token_capability: { _is_null: false }\n        _not: { spent_by: { transaction: { hash: { _gt: \"\" } } } }\n      }\n    ) {\n      token_category\n      nonfungible_token_capability\n      nonfungible_token_commitment\n    }\n  }\n"): (typeof documents)["\n  query GetAddressNFTs(\n    $limit: Int\n    $offset: Int\n    $network: String\n    $lockingBytecode: _text\n  ) {\n    search_output(\n      limit: $limit\n      offset: $offset\n      args: { locking_bytecode_hex: $lockingBytecode }\n      where: {\n        token_category: { _is_null: false }\n        transaction: {\n          block_inclusions: {\n            block: { accepted_by: { node: { name: { _regex: $network } } } }\n          }\n        }\n        nonfungible_token_capability: { _is_null: false }\n        _not: { spent_by: { transaction: { hash: { _gt: \"\" } } } }\n      }\n    ) {\n      token_category\n      nonfungible_token_capability\n      nonfungible_token_commitment\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetAddressTokens(\n    $limit: Int\n    $offset: Int\n    $network: String\n    $lockingBytecode: _text\n  ) {\n    search_output(\n      limit: $limit\n      offset: $offset\n      args: { locking_bytecode_hex: $lockingBytecode }\n      where: {\n        token_category: { _is_null: false }\n        transaction: {\n          block_inclusions: {\n            block: { accepted_by: { node: { name: { _regex: $network } } } }\n          }\n        }\n        nonfungible_token_capability: { _is_null: true }\n        _not: { spent_by: { transaction: { hash: { _gt: \"\" } } } }\n      }\n    ) {\n      token_category\n      fungible_token_amount\n    }\n  }\n"): (typeof documents)["\n  query GetAddressTokens(\n    $limit: Int\n    $offset: Int\n    $network: String\n    $lockingBytecode: _text\n  ) {\n    search_output(\n      limit: $limit\n      offset: $offset\n      args: { locking_bytecode_hex: $lockingBytecode }\n      where: {\n        token_category: { _is_null: false }\n        transaction: {\n          block_inclusions: {\n            block: { accepted_by: { node: { name: { _regex: $network } } } }\n          }\n        }\n        nonfungible_token_capability: { _is_null: true }\n        _not: { spent_by: { transaction: { hash: { _gt: \"\" } } } }\n      }\n    ) {\n      token_category\n      fungible_token_amount\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;