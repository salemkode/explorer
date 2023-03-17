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
    "\n  query GetTx($network: String, $hash: bytea) {\n    block_transaction(\n      where: {\n        transaction: {\n          block_inclusions: {\n            block: { accepted_by: { node: { name: { _regex: $network } } } }\n          }\n          hash: { _eq: $hash }\n        }\n      }\n    ) {\n      block {\n        height\n        timestamp\n      }\n      transaction {\n        hash\n        input_value_satoshis\n        output_value_satoshis\n        block_inclusions {\n          block {\n            height\n          }\n        }\n      }\n    }\n  }\n": types.GetTxDocument,
    "\n  query LastTransaction($network: String) {\n    block(\n      limit: 1\n      order_by: { height: desc }\n      where: { accepted_by: { node: { name: { _regex: $network } } } }\n    ) {\n      height\n      transactions(limit: 10) {\n        transaction {\n          hash\n          input_value_satoshis\n          output_value_satoshis\n        }\n      }\n    }\n  }\n": types.LastTransactionDocument,
    "\n  subscription GetLastBlock($network: String) {\n    node_block(\n      where: { node: { name: { _regex: \"mainnet\" } } }\n      order_by: { block: { height: desc } }\n      limit: 1\n    ) {\n      block {\n        height\n      }\n    }\n  }\n": types.GetLastBlockDocument,
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
export function gql(source: "\n  query GetTx($network: String, $hash: bytea) {\n    block_transaction(\n      where: {\n        transaction: {\n          block_inclusions: {\n            block: { accepted_by: { node: { name: { _regex: $network } } } }\n          }\n          hash: { _eq: $hash }\n        }\n      }\n    ) {\n      block {\n        height\n        timestamp\n      }\n      transaction {\n        hash\n        input_value_satoshis\n        output_value_satoshis\n        block_inclusions {\n          block {\n            height\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetTx($network: String, $hash: bytea) {\n    block_transaction(\n      where: {\n        transaction: {\n          block_inclusions: {\n            block: { accepted_by: { node: { name: { _regex: $network } } } }\n          }\n          hash: { _eq: $hash }\n        }\n      }\n    ) {\n      block {\n        height\n        timestamp\n      }\n      transaction {\n        hash\n        input_value_satoshis\n        output_value_satoshis\n        block_inclusions {\n          block {\n            height\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query LastTransaction($network: String) {\n    block(\n      limit: 1\n      order_by: { height: desc }\n      where: { accepted_by: { node: { name: { _regex: $network } } } }\n    ) {\n      height\n      transactions(limit: 10) {\n        transaction {\n          hash\n          input_value_satoshis\n          output_value_satoshis\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query LastTransaction($network: String) {\n    block(\n      limit: 1\n      order_by: { height: desc }\n      where: { accepted_by: { node: { name: { _regex: $network } } } }\n    ) {\n      height\n      transactions(limit: 10) {\n        transaction {\n          hash\n          input_value_satoshis\n          output_value_satoshis\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription GetLastBlock($network: String) {\n    node_block(\n      where: { node: { name: { _regex: \"mainnet\" } } }\n      order_by: { block: { height: desc } }\n      limit: 1\n    ) {\n      block {\n        height\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription GetLastBlock($network: String) {\n    node_block(\n      where: { node: { name: { _regex: \"mainnet\" } } }\n      order_by: { block: { height: desc } }\n      limit: 1\n    ) {\n      block {\n        height\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;