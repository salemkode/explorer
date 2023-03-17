/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  _text: any;
  bigint: any;
  bytea: string;
  enum_nonfungible_token_capability: any;
  timestamp: any;
};

export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']>;
  _gt?: InputMaybe<Scalars['Boolean']>;
  _gte?: InputMaybe<Scalars['Boolean']>;
  _in?: InputMaybe<Array<Scalars['Boolean']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['Boolean']>;
  _lte?: InputMaybe<Scalars['Boolean']>;
  _neq?: InputMaybe<Scalars['Boolean']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']>>;
};

export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']>;
  _gt?: InputMaybe<Scalars['Int']>;
  _gte?: InputMaybe<Scalars['Int']>;
  _in?: InputMaybe<Array<Scalars['Int']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['Int']>;
  _lte?: InputMaybe<Scalars['Int']>;
  _neq?: InputMaybe<Scalars['Int']>;
  _nin?: InputMaybe<Array<Scalars['Int']>>;
};

export type SendTransactionRequest = {
  encoded_hex: Scalars['String'];
  node_internal_id: Scalars['bigint'];
};

export type SendTransactionResult = {
  __typename?: 'SendTransactionResult';
  transaction_hash: Scalars['String'];
  transmission_error_message?: Maybe<Scalars['String']>;
  transmission_success: Scalars['Boolean'];
  validation_error_message?: Maybe<Scalars['String']>;
  validation_success: Scalars['Boolean'];
};

export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']>;
  _gt?: InputMaybe<Scalars['String']>;
  _gte?: InputMaybe<Scalars['String']>;
  _ilike?: InputMaybe<Scalars['String']>;
  _in?: InputMaybe<Array<Scalars['String']>>;
  _iregex?: InputMaybe<Scalars['String']>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _like?: InputMaybe<Scalars['String']>;
  _lt?: InputMaybe<Scalars['String']>;
  _lte?: InputMaybe<Scalars['String']>;
  _neq?: InputMaybe<Scalars['String']>;
  _nilike?: InputMaybe<Scalars['String']>;
  _nin?: InputMaybe<Array<Scalars['String']>>;
  _niregex?: InputMaybe<Scalars['String']>;
  _nlike?: InputMaybe<Scalars['String']>;
  _nregex?: InputMaybe<Scalars['String']>;
  _nsimilar?: InputMaybe<Scalars['String']>;
  _regex?: InputMaybe<Scalars['String']>;
  _similar?: InputMaybe<Scalars['String']>;
};

export type Authchain_Migrations_View = {
  __typename?: 'authchain_migrations_view';
  authbase_internal_id?: Maybe<Scalars['bigint']>;
  migration_index?: Maybe<Scalars['bigint']>;
  migration_transaction_internal_id?: Maybe<Scalars['bigint']>;
  transaction?: Maybe<Array<Transaction>>;
};


export type Authchain_Migrations_ViewTransactionArgs = {
  distinct_on?: InputMaybe<Array<Transaction_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Transaction_Order_By>>;
  where?: InputMaybe<Transaction_Bool_Exp>;
};

export type Authchain_Migrations_View_Aggregate_Order_By = {
  avg?: InputMaybe<Authchain_Migrations_View_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Authchain_Migrations_View_Max_Order_By>;
  min?: InputMaybe<Authchain_Migrations_View_Min_Order_By>;
  stddev?: InputMaybe<Authchain_Migrations_View_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Authchain_Migrations_View_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Authchain_Migrations_View_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Authchain_Migrations_View_Sum_Order_By>;
  var_pop?: InputMaybe<Authchain_Migrations_View_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Authchain_Migrations_View_Var_Samp_Order_By>;
  variance?: InputMaybe<Authchain_Migrations_View_Variance_Order_By>;
};

export type Authchain_Migrations_View_Avg_Order_By = {
  authbase_internal_id?: InputMaybe<Order_By>;
  migration_index?: InputMaybe<Order_By>;
  migration_transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_Migrations_View_Bool_Exp = {
  _and?: InputMaybe<Array<Authchain_Migrations_View_Bool_Exp>>;
  _not?: InputMaybe<Authchain_Migrations_View_Bool_Exp>;
  _or?: InputMaybe<Array<Authchain_Migrations_View_Bool_Exp>>;
  authbase_internal_id?: InputMaybe<Bigint_Comparison_Exp>;
  migration_index?: InputMaybe<Bigint_Comparison_Exp>;
  migration_transaction_internal_id?: InputMaybe<Bigint_Comparison_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
};

export type Authchain_Migrations_View_Max_Order_By = {
  authbase_internal_id?: InputMaybe<Order_By>;
  migration_index?: InputMaybe<Order_By>;
  migration_transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_Migrations_View_Min_Order_By = {
  authbase_internal_id?: InputMaybe<Order_By>;
  migration_index?: InputMaybe<Order_By>;
  migration_transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_Migrations_View_Order_By = {
  authbase_internal_id?: InputMaybe<Order_By>;
  migration_index?: InputMaybe<Order_By>;
  migration_transaction_internal_id?: InputMaybe<Order_By>;
  transaction_aggregate?: InputMaybe<Transaction_Aggregate_Order_By>;
};

export enum Authchain_Migrations_View_Select_Column {
  AuthbaseInternalId = 'authbase_internal_id',
  MigrationIndex = 'migration_index',
  MigrationTransactionInternalId = 'migration_transaction_internal_id'
}

export type Authchain_Migrations_View_Stddev_Order_By = {
  authbase_internal_id?: InputMaybe<Order_By>;
  migration_index?: InputMaybe<Order_By>;
  migration_transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_Migrations_View_Stddev_Pop_Order_By = {
  authbase_internal_id?: InputMaybe<Order_By>;
  migration_index?: InputMaybe<Order_By>;
  migration_transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_Migrations_View_Stddev_Samp_Order_By = {
  authbase_internal_id?: InputMaybe<Order_By>;
  migration_index?: InputMaybe<Order_By>;
  migration_transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_Migrations_View_Stream_Cursor_Input = {
  initial_value: Authchain_Migrations_View_Stream_Cursor_Value_Input;
  ordering?: InputMaybe<Cursor_Ordering>;
};

export type Authchain_Migrations_View_Stream_Cursor_Value_Input = {
  authbase_internal_id?: InputMaybe<Scalars['bigint']>;
  migration_index?: InputMaybe<Scalars['bigint']>;
  migration_transaction_internal_id?: InputMaybe<Scalars['bigint']>;
};

export type Authchain_Migrations_View_Sum_Order_By = {
  authbase_internal_id?: InputMaybe<Order_By>;
  migration_index?: InputMaybe<Order_By>;
  migration_transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_Migrations_View_Var_Pop_Order_By = {
  authbase_internal_id?: InputMaybe<Order_By>;
  migration_index?: InputMaybe<Order_By>;
  migration_transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_Migrations_View_Var_Samp_Order_By = {
  authbase_internal_id?: InputMaybe<Order_By>;
  migration_index?: InputMaybe<Order_By>;
  migration_transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_Migrations_View_Variance_Order_By = {
  authbase_internal_id?: InputMaybe<Order_By>;
  migration_index?: InputMaybe<Order_By>;
  migration_transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_View = {
  __typename?: 'authchain_view';
  authchain_length?: Maybe<Scalars['Int']>;
  authhead?: Maybe<Transaction>;
  authhead_transaction_hash?: Maybe<Scalars['bytea']>;
  migrations: Array<Authchain_Migrations_View>;
  transaction_internal_id?: Maybe<Scalars['bigint']>;
  unspent_authhead?: Maybe<Scalars['Boolean']>;
};


export type Authchain_ViewMigrationsArgs = {
  distinct_on?: InputMaybe<Array<Authchain_Migrations_View_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Authchain_Migrations_View_Order_By>>;
  where?: InputMaybe<Authchain_Migrations_View_Bool_Exp>;
};

export type Authchain_View_Aggregate_Order_By = {
  avg?: InputMaybe<Authchain_View_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Authchain_View_Max_Order_By>;
  min?: InputMaybe<Authchain_View_Min_Order_By>;
  stddev?: InputMaybe<Authchain_View_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Authchain_View_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Authchain_View_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Authchain_View_Sum_Order_By>;
  var_pop?: InputMaybe<Authchain_View_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Authchain_View_Var_Samp_Order_By>;
  variance?: InputMaybe<Authchain_View_Variance_Order_By>;
};

export type Authchain_View_Avg_Order_By = {
  authchain_length?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_View_Bool_Exp = {
  _and?: InputMaybe<Array<Authchain_View_Bool_Exp>>;
  _not?: InputMaybe<Authchain_View_Bool_Exp>;
  _or?: InputMaybe<Array<Authchain_View_Bool_Exp>>;
  authchain_length?: InputMaybe<Int_Comparison_Exp>;
  authhead?: InputMaybe<Transaction_Bool_Exp>;
  authhead_transaction_hash?: InputMaybe<Bytea_Comparison_Exp>;
  migrations?: InputMaybe<Authchain_Migrations_View_Bool_Exp>;
  transaction_internal_id?: InputMaybe<Bigint_Comparison_Exp>;
  unspent_authhead?: InputMaybe<Boolean_Comparison_Exp>;
};

export type Authchain_View_Max_Order_By = {
  authchain_length?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_View_Min_Order_By = {
  authchain_length?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_View_Order_By = {
  authchain_length?: InputMaybe<Order_By>;
  authhead?: InputMaybe<Transaction_Order_By>;
  authhead_transaction_hash?: InputMaybe<Order_By>;
  migrations_aggregate?: InputMaybe<Authchain_Migrations_View_Aggregate_Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
  unspent_authhead?: InputMaybe<Order_By>;
};

export enum Authchain_View_Select_Column {
  AuthchainLength = 'authchain_length',
  AuthheadTransactionHash = 'authhead_transaction_hash',
  TransactionInternalId = 'transaction_internal_id',
  UnspentAuthhead = 'unspent_authhead'
}

export type Authchain_View_Stddev_Order_By = {
  authchain_length?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_View_Stddev_Pop_Order_By = {
  authchain_length?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_View_Stddev_Samp_Order_By = {
  authchain_length?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_View_Stream_Cursor_Input = {
  initial_value: Authchain_View_Stream_Cursor_Value_Input;
  ordering?: InputMaybe<Cursor_Ordering>;
};

export type Authchain_View_Stream_Cursor_Value_Input = {
  authchain_length?: InputMaybe<Scalars['Int']>;
  authhead_transaction_hash?: InputMaybe<Scalars['bytea']>;
  transaction_internal_id?: InputMaybe<Scalars['bigint']>;
  unspent_authhead?: InputMaybe<Scalars['Boolean']>;
};

export type Authchain_View_Sum_Order_By = {
  authchain_length?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_View_Var_Pop_Order_By = {
  authchain_length?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_View_Var_Samp_Order_By = {
  authchain_length?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Authchain_View_Variance_Order_By = {
  authchain_length?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Bigint_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['bigint']>;
  _gt?: InputMaybe<Scalars['bigint']>;
  _gte?: InputMaybe<Scalars['bigint']>;
  _in?: InputMaybe<Array<Scalars['bigint']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['bigint']>;
  _lte?: InputMaybe<Scalars['bigint']>;
  _neq?: InputMaybe<Scalars['bigint']>;
  _nin?: InputMaybe<Array<Scalars['bigint']>>;
};

export type Block = {
  __typename?: 'block';
  accepted_by: Array<Node_Block>;
  bits: Scalars['bigint'];
  encoded_hex?: Maybe<Scalars['String']>;
  fee_satoshis?: Maybe<Scalars['bigint']>;
  generated_value_satoshis?: Maybe<Scalars['bigint']>;
  hash: Scalars['bytea'];
  header?: Maybe<Scalars['String']>;
  height: Scalars['bigint'];
  input_count?: Maybe<Scalars['bigint']>;
  input_value_satoshis?: Maybe<Scalars['bigint']>;
  internal_id: Scalars['bigint'];
  merkle_root: Scalars['bytea'];
  nonce: Scalars['bigint'];
  output_count?: Maybe<Scalars['bigint']>;
  output_value_satoshis?: Maybe<Scalars['bigint']>;
  previous_block?: Maybe<Block>;
  previous_block_hash: Scalars['bytea'];
  size_bytes: Scalars['bigint'];
  timestamp: Scalars['bigint'];
  transaction_count?: Maybe<Scalars['bigint']>;
  transactions: Array<Block_Transaction>;
  version: Scalars['bigint'];
};


export type BlockAccepted_ByArgs = {
  distinct_on?: InputMaybe<Array<Node_Block_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Node_Block_Order_By>>;
  where?: InputMaybe<Node_Block_Bool_Exp>;
};


export type BlockTransactionsArgs = {
  distinct_on?: InputMaybe<Array<Block_Transaction_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Block_Transaction_Order_By>>;
  where?: InputMaybe<Block_Transaction_Bool_Exp>;
};

export type Block_Bool_Exp = {
  _and?: InputMaybe<Array<Block_Bool_Exp>>;
  _not?: InputMaybe<Block_Bool_Exp>;
  _or?: InputMaybe<Array<Block_Bool_Exp>>;
  accepted_by?: InputMaybe<Node_Block_Bool_Exp>;
  bits?: InputMaybe<Bigint_Comparison_Exp>;
  encoded_hex?: InputMaybe<String_Comparison_Exp>;
  fee_satoshis?: InputMaybe<Bigint_Comparison_Exp>;
  generated_value_satoshis?: InputMaybe<Bigint_Comparison_Exp>;
  hash?: InputMaybe<Bytea_Comparison_Exp>;
  header?: InputMaybe<String_Comparison_Exp>;
  height?: InputMaybe<Bigint_Comparison_Exp>;
  input_count?: InputMaybe<Bigint_Comparison_Exp>;
  input_value_satoshis?: InputMaybe<Bigint_Comparison_Exp>;
  internal_id?: InputMaybe<Bigint_Comparison_Exp>;
  merkle_root?: InputMaybe<Bytea_Comparison_Exp>;
  nonce?: InputMaybe<Bigint_Comparison_Exp>;
  output_count?: InputMaybe<Bigint_Comparison_Exp>;
  output_value_satoshis?: InputMaybe<Bigint_Comparison_Exp>;
  previous_block?: InputMaybe<Block_Bool_Exp>;
  previous_block_hash?: InputMaybe<Bytea_Comparison_Exp>;
  size_bytes?: InputMaybe<Bigint_Comparison_Exp>;
  timestamp?: InputMaybe<Bigint_Comparison_Exp>;
  transaction_count?: InputMaybe<Bigint_Comparison_Exp>;
  transactions?: InputMaybe<Block_Transaction_Bool_Exp>;
  version?: InputMaybe<Bigint_Comparison_Exp>;
};

export type Block_Order_By = {
  accepted_by_aggregate?: InputMaybe<Node_Block_Aggregate_Order_By>;
  bits?: InputMaybe<Order_By>;
  encoded_hex?: InputMaybe<Order_By>;
  fee_satoshis?: InputMaybe<Order_By>;
  generated_value_satoshis?: InputMaybe<Order_By>;
  hash?: InputMaybe<Order_By>;
  header?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  input_count?: InputMaybe<Order_By>;
  input_value_satoshis?: InputMaybe<Order_By>;
  internal_id?: InputMaybe<Order_By>;
  merkle_root?: InputMaybe<Order_By>;
  nonce?: InputMaybe<Order_By>;
  output_count?: InputMaybe<Order_By>;
  output_value_satoshis?: InputMaybe<Order_By>;
  previous_block?: InputMaybe<Block_Order_By>;
  previous_block_hash?: InputMaybe<Order_By>;
  size_bytes?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  transaction_count?: InputMaybe<Order_By>;
  transactions_aggregate?: InputMaybe<Block_Transaction_Aggregate_Order_By>;
  version?: InputMaybe<Order_By>;
};

export enum Block_Select_Column {
  Bits = 'bits',
  Hash = 'hash',
  Height = 'height',
  InternalId = 'internal_id',
  MerkleRoot = 'merkle_root',
  Nonce = 'nonce',
  PreviousBlockHash = 'previous_block_hash',
  SizeBytes = 'size_bytes',
  Timestamp = 'timestamp',
  Version = 'version'
}

export type Block_Stream_Cursor_Input = {
  initial_value: Block_Stream_Cursor_Value_Input;
  ordering?: InputMaybe<Cursor_Ordering>;
};

export type Block_Stream_Cursor_Value_Input = {
  bits?: InputMaybe<Scalars['bigint']>;
  hash?: InputMaybe<Scalars['bytea']>;
  height?: InputMaybe<Scalars['bigint']>;
  internal_id?: InputMaybe<Scalars['bigint']>;
  merkle_root?: InputMaybe<Scalars['bytea']>;
  nonce?: InputMaybe<Scalars['bigint']>;
  previous_block_hash?: InputMaybe<Scalars['bytea']>;
  size_bytes?: InputMaybe<Scalars['bigint']>;
  timestamp?: InputMaybe<Scalars['bigint']>;
  version?: InputMaybe<Scalars['bigint']>;
};

export type Block_Transaction = {
  __typename?: 'block_transaction';
  block: Block;
  block_internal_id: Scalars['bigint'];
  transaction: Transaction;
  transaction_index: Scalars['bigint'];
  transaction_internal_id: Scalars['bigint'];
};

export type Block_Transaction_Aggregate_Order_By = {
  avg?: InputMaybe<Block_Transaction_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Block_Transaction_Max_Order_By>;
  min?: InputMaybe<Block_Transaction_Min_Order_By>;
  stddev?: InputMaybe<Block_Transaction_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Block_Transaction_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Block_Transaction_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Block_Transaction_Sum_Order_By>;
  var_pop?: InputMaybe<Block_Transaction_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Block_Transaction_Var_Samp_Order_By>;
  variance?: InputMaybe<Block_Transaction_Variance_Order_By>;
};

export type Block_Transaction_Avg_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  transaction_index?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Block_Transaction_Bool_Exp = {
  _and?: InputMaybe<Array<Block_Transaction_Bool_Exp>>;
  _not?: InputMaybe<Block_Transaction_Bool_Exp>;
  _or?: InputMaybe<Array<Block_Transaction_Bool_Exp>>;
  block?: InputMaybe<Block_Bool_Exp>;
  block_internal_id?: InputMaybe<Bigint_Comparison_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
  transaction_index?: InputMaybe<Bigint_Comparison_Exp>;
  transaction_internal_id?: InputMaybe<Bigint_Comparison_Exp>;
};

export type Block_Transaction_Max_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  transaction_index?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Block_Transaction_Min_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  transaction_index?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Block_Transaction_Order_By = {
  block?: InputMaybe<Block_Order_By>;
  block_internal_id?: InputMaybe<Order_By>;
  transaction?: InputMaybe<Transaction_Order_By>;
  transaction_index?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export enum Block_Transaction_Select_Column {
  BlockInternalId = 'block_internal_id',
  TransactionIndex = 'transaction_index',
  TransactionInternalId = 'transaction_internal_id'
}

export type Block_Transaction_Stddev_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  transaction_index?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Block_Transaction_Stddev_Pop_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  transaction_index?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Block_Transaction_Stddev_Samp_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  transaction_index?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Block_Transaction_Stream_Cursor_Input = {
  initial_value: Block_Transaction_Stream_Cursor_Value_Input;
  ordering?: InputMaybe<Cursor_Ordering>;
};

export type Block_Transaction_Stream_Cursor_Value_Input = {
  block_internal_id?: InputMaybe<Scalars['bigint']>;
  transaction_index?: InputMaybe<Scalars['bigint']>;
  transaction_internal_id?: InputMaybe<Scalars['bigint']>;
};

export type Block_Transaction_Sum_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  transaction_index?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Block_Transaction_Var_Pop_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  transaction_index?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Block_Transaction_Var_Samp_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  transaction_index?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Block_Transaction_Variance_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  transaction_index?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Bytea_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['bytea']>;
  _gt?: InputMaybe<Scalars['bytea']>;
  _gte?: InputMaybe<Scalars['bytea']>;
  _in?: InputMaybe<Array<Scalars['bytea']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['bytea']>;
  _lte?: InputMaybe<Scalars['bytea']>;
  _neq?: InputMaybe<Scalars['bytea']>;
  _nin?: InputMaybe<Array<Scalars['bytea']>>;
};

export enum Cursor_Ordering {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Enum_Nonfungible_Token_Capability_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['enum_nonfungible_token_capability']>;
  _gt?: InputMaybe<Scalars['enum_nonfungible_token_capability']>;
  _gte?: InputMaybe<Scalars['enum_nonfungible_token_capability']>;
  _in?: InputMaybe<Array<Scalars['enum_nonfungible_token_capability']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['enum_nonfungible_token_capability']>;
  _lte?: InputMaybe<Scalars['enum_nonfungible_token_capability']>;
  _neq?: InputMaybe<Scalars['enum_nonfungible_token_capability']>;
  _nin?: InputMaybe<Array<Scalars['enum_nonfungible_token_capability']>>;
};

export type Input = {
  __typename?: 'input';
  input_index: Scalars['bigint'];
  outpoint?: Maybe<Output>;
  outpoint_index: Scalars['bigint'];
  outpoint_transaction?: Maybe<Output>;
  outpoint_transaction_hash: Scalars['bytea'];
  redeem_bytecode_pattern?: Maybe<Scalars['String']>;
  sequence_number: Scalars['bigint'];
  transaction: Transaction;
  transaction_internal_id: Scalars['bigint'];
  unlocking_bytecode: Scalars['bytea'];
  unlocking_bytecode_pattern?: Maybe<Scalars['String']>;
  value_satoshis?: Maybe<Scalars['bigint']>;
};

export type Input_Aggregate_Order_By = {
  avg?: InputMaybe<Input_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Input_Max_Order_By>;
  min?: InputMaybe<Input_Min_Order_By>;
  stddev?: InputMaybe<Input_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Input_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Input_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Input_Sum_Order_By>;
  var_pop?: InputMaybe<Input_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Input_Var_Samp_Order_By>;
  variance?: InputMaybe<Input_Variance_Order_By>;
};

export type Input_Avg_Order_By = {
  input_index?: InputMaybe<Order_By>;
  outpoint_index?: InputMaybe<Order_By>;
  sequence_number?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Input_Bool_Exp = {
  _and?: InputMaybe<Array<Input_Bool_Exp>>;
  _not?: InputMaybe<Input_Bool_Exp>;
  _or?: InputMaybe<Array<Input_Bool_Exp>>;
  input_index?: InputMaybe<Bigint_Comparison_Exp>;
  outpoint?: InputMaybe<Output_Bool_Exp>;
  outpoint_index?: InputMaybe<Bigint_Comparison_Exp>;
  outpoint_transaction?: InputMaybe<Output_Bool_Exp>;
  outpoint_transaction_hash?: InputMaybe<Bytea_Comparison_Exp>;
  redeem_bytecode_pattern?: InputMaybe<String_Comparison_Exp>;
  sequence_number?: InputMaybe<Bigint_Comparison_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
  transaction_internal_id?: InputMaybe<Bigint_Comparison_Exp>;
  unlocking_bytecode?: InputMaybe<Bytea_Comparison_Exp>;
  unlocking_bytecode_pattern?: InputMaybe<String_Comparison_Exp>;
  value_satoshis?: InputMaybe<Bigint_Comparison_Exp>;
};

export type Input_Max_Order_By = {
  input_index?: InputMaybe<Order_By>;
  outpoint_index?: InputMaybe<Order_By>;
  sequence_number?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Input_Min_Order_By = {
  input_index?: InputMaybe<Order_By>;
  outpoint_index?: InputMaybe<Order_By>;
  sequence_number?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Input_Order_By = {
  input_index?: InputMaybe<Order_By>;
  outpoint?: InputMaybe<Output_Order_By>;
  outpoint_index?: InputMaybe<Order_By>;
  outpoint_transaction?: InputMaybe<Output_Order_By>;
  outpoint_transaction_hash?: InputMaybe<Order_By>;
  redeem_bytecode_pattern?: InputMaybe<Order_By>;
  sequence_number?: InputMaybe<Order_By>;
  transaction?: InputMaybe<Transaction_Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
  unlocking_bytecode?: InputMaybe<Order_By>;
  unlocking_bytecode_pattern?: InputMaybe<Order_By>;
  value_satoshis?: InputMaybe<Order_By>;
};

export enum Input_Select_Column {
  InputIndex = 'input_index',
  OutpointIndex = 'outpoint_index',
  OutpointTransactionHash = 'outpoint_transaction_hash',
  SequenceNumber = 'sequence_number',
  TransactionInternalId = 'transaction_internal_id',
  UnlockingBytecode = 'unlocking_bytecode'
}

export type Input_Stddev_Order_By = {
  input_index?: InputMaybe<Order_By>;
  outpoint_index?: InputMaybe<Order_By>;
  sequence_number?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Input_Stddev_Pop_Order_By = {
  input_index?: InputMaybe<Order_By>;
  outpoint_index?: InputMaybe<Order_By>;
  sequence_number?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Input_Stddev_Samp_Order_By = {
  input_index?: InputMaybe<Order_By>;
  outpoint_index?: InputMaybe<Order_By>;
  sequence_number?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Input_Stream_Cursor_Input = {
  initial_value: Input_Stream_Cursor_Value_Input;
  ordering?: InputMaybe<Cursor_Ordering>;
};

export type Input_Stream_Cursor_Value_Input = {
  input_index?: InputMaybe<Scalars['bigint']>;
  outpoint_index?: InputMaybe<Scalars['bigint']>;
  outpoint_transaction_hash?: InputMaybe<Scalars['bytea']>;
  sequence_number?: InputMaybe<Scalars['bigint']>;
  transaction_internal_id?: InputMaybe<Scalars['bigint']>;
  unlocking_bytecode?: InputMaybe<Scalars['bytea']>;
};

export type Input_Sum_Order_By = {
  input_index?: InputMaybe<Order_By>;
  outpoint_index?: InputMaybe<Order_By>;
  sequence_number?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Input_Var_Pop_Order_By = {
  input_index?: InputMaybe<Order_By>;
  outpoint_index?: InputMaybe<Order_By>;
  sequence_number?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Input_Var_Samp_Order_By = {
  input_index?: InputMaybe<Order_By>;
  outpoint_index?: InputMaybe<Order_By>;
  sequence_number?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Input_Variance_Order_By = {
  input_index?: InputMaybe<Order_By>;
  outpoint_index?: InputMaybe<Order_By>;
  sequence_number?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Mutation_Root = {
  __typename?: 'mutation_root';
  send_transaction: SendTransactionResult;
};


export type Mutation_RootSend_TransactionArgs = {
  request: SendTransactionRequest;
};

export type Node = {
  __typename?: 'node';
  accepted_blocks: Array<Node_Block>;
  first_connected_at: Scalars['timestamp'];
  internal_id: Scalars['Int'];
  latest_connection_began_at: Scalars['timestamp'];
  name: Scalars['String'];
  protocol_version: Scalars['Int'];
  unconfirmed_transaction_count?: Maybe<Scalars['bigint']>;
  unconfirmed_transactions: Array<Node_Transaction>;
  user_agent: Scalars['String'];
};


export type NodeAccepted_BlocksArgs = {
  distinct_on?: InputMaybe<Array<Node_Block_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Node_Block_Order_By>>;
  where?: InputMaybe<Node_Block_Bool_Exp>;
};


export type NodeUnconfirmed_TransactionsArgs = {
  distinct_on?: InputMaybe<Array<Node_Transaction_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Node_Transaction_Order_By>>;
  where?: InputMaybe<Node_Transaction_Bool_Exp>;
};

export type Node_Block = {
  __typename?: 'node_block';
  accepted_at?: Maybe<Scalars['timestamp']>;
  block: Block;
  block_internal_id: Scalars['bigint'];
  node: Node;
  node_internal_id: Scalars['Int'];
};

export type Node_Block_Aggregate_Order_By = {
  avg?: InputMaybe<Node_Block_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Node_Block_Max_Order_By>;
  min?: InputMaybe<Node_Block_Min_Order_By>;
  stddev?: InputMaybe<Node_Block_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Node_Block_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Node_Block_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Node_Block_Sum_Order_By>;
  var_pop?: InputMaybe<Node_Block_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Node_Block_Var_Samp_Order_By>;
  variance?: InputMaybe<Node_Block_Variance_Order_By>;
};

export type Node_Block_Avg_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
};

export type Node_Block_Bool_Exp = {
  _and?: InputMaybe<Array<Node_Block_Bool_Exp>>;
  _not?: InputMaybe<Node_Block_Bool_Exp>;
  _or?: InputMaybe<Array<Node_Block_Bool_Exp>>;
  accepted_at?: InputMaybe<Timestamp_Comparison_Exp>;
  block?: InputMaybe<Block_Bool_Exp>;
  block_internal_id?: InputMaybe<Bigint_Comparison_Exp>;
  node?: InputMaybe<Node_Bool_Exp>;
  node_internal_id?: InputMaybe<Int_Comparison_Exp>;
};

export type Node_Block_History = {
  __typename?: 'node_block_history';
  accepted_at?: Maybe<Scalars['timestamp']>;
  block: Block;
  block_internal_id: Scalars['bigint'];
  internal_id: Scalars['bigint'];
  node: Node;
  node_internal_id: Scalars['Int'];
  removed_at: Scalars['timestamp'];
};

export type Node_Block_History_Bool_Exp = {
  _and?: InputMaybe<Array<Node_Block_History_Bool_Exp>>;
  _not?: InputMaybe<Node_Block_History_Bool_Exp>;
  _or?: InputMaybe<Array<Node_Block_History_Bool_Exp>>;
  accepted_at?: InputMaybe<Timestamp_Comparison_Exp>;
  block?: InputMaybe<Block_Bool_Exp>;
  block_internal_id?: InputMaybe<Bigint_Comparison_Exp>;
  internal_id?: InputMaybe<Bigint_Comparison_Exp>;
  node?: InputMaybe<Node_Bool_Exp>;
  node_internal_id?: InputMaybe<Int_Comparison_Exp>;
  removed_at?: InputMaybe<Timestamp_Comparison_Exp>;
};

export type Node_Block_History_Order_By = {
  accepted_at?: InputMaybe<Order_By>;
  block?: InputMaybe<Block_Order_By>;
  block_internal_id?: InputMaybe<Order_By>;
  internal_id?: InputMaybe<Order_By>;
  node?: InputMaybe<Node_Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
  removed_at?: InputMaybe<Order_By>;
};

export enum Node_Block_History_Select_Column {
  AcceptedAt = 'accepted_at',
  BlockInternalId = 'block_internal_id',
  InternalId = 'internal_id',
  NodeInternalId = 'node_internal_id',
  RemovedAt = 'removed_at'
}

export type Node_Block_History_Stream_Cursor_Input = {
  initial_value: Node_Block_History_Stream_Cursor_Value_Input;
  ordering?: InputMaybe<Cursor_Ordering>;
};

export type Node_Block_History_Stream_Cursor_Value_Input = {
  accepted_at?: InputMaybe<Scalars['timestamp']>;
  block_internal_id?: InputMaybe<Scalars['bigint']>;
  internal_id?: InputMaybe<Scalars['bigint']>;
  node_internal_id?: InputMaybe<Scalars['Int']>;
  removed_at?: InputMaybe<Scalars['timestamp']>;
};

export type Node_Block_Max_Order_By = {
  accepted_at?: InputMaybe<Order_By>;
  block_internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
};

export type Node_Block_Min_Order_By = {
  accepted_at?: InputMaybe<Order_By>;
  block_internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
};

export type Node_Block_Order_By = {
  accepted_at?: InputMaybe<Order_By>;
  block?: InputMaybe<Block_Order_By>;
  block_internal_id?: InputMaybe<Order_By>;
  node?: InputMaybe<Node_Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
};

export enum Node_Block_Select_Column {
  AcceptedAt = 'accepted_at',
  BlockInternalId = 'block_internal_id',
  NodeInternalId = 'node_internal_id'
}

export type Node_Block_Stddev_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
};

export type Node_Block_Stddev_Pop_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
};

export type Node_Block_Stddev_Samp_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
};

export type Node_Block_Stream_Cursor_Input = {
  initial_value: Node_Block_Stream_Cursor_Value_Input;
  ordering?: InputMaybe<Cursor_Ordering>;
};

export type Node_Block_Stream_Cursor_Value_Input = {
  accepted_at?: InputMaybe<Scalars['timestamp']>;
  block_internal_id?: InputMaybe<Scalars['bigint']>;
  node_internal_id?: InputMaybe<Scalars['Int']>;
};

export type Node_Block_Sum_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
};

export type Node_Block_Var_Pop_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
};

export type Node_Block_Var_Samp_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
};

export type Node_Block_Variance_Order_By = {
  block_internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
};

export type Node_Bool_Exp = {
  _and?: InputMaybe<Array<Node_Bool_Exp>>;
  _not?: InputMaybe<Node_Bool_Exp>;
  _or?: InputMaybe<Array<Node_Bool_Exp>>;
  accepted_blocks?: InputMaybe<Node_Block_Bool_Exp>;
  first_connected_at?: InputMaybe<Timestamp_Comparison_Exp>;
  internal_id?: InputMaybe<Int_Comparison_Exp>;
  latest_connection_began_at?: InputMaybe<Timestamp_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  protocol_version?: InputMaybe<Int_Comparison_Exp>;
  unconfirmed_transaction_count?: InputMaybe<Bigint_Comparison_Exp>;
  unconfirmed_transactions?: InputMaybe<Node_Transaction_Bool_Exp>;
  user_agent?: InputMaybe<String_Comparison_Exp>;
};

export type Node_Order_By = {
  accepted_blocks_aggregate?: InputMaybe<Node_Block_Aggregate_Order_By>;
  first_connected_at?: InputMaybe<Order_By>;
  internal_id?: InputMaybe<Order_By>;
  latest_connection_began_at?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  protocol_version?: InputMaybe<Order_By>;
  unconfirmed_transaction_count?: InputMaybe<Order_By>;
  unconfirmed_transactions_aggregate?: InputMaybe<Node_Transaction_Aggregate_Order_By>;
  user_agent?: InputMaybe<Order_By>;
};

export enum Node_Select_Column {
  FirstConnectedAt = 'first_connected_at',
  InternalId = 'internal_id',
  LatestConnectionBeganAt = 'latest_connection_began_at',
  Name = 'name',
  ProtocolVersion = 'protocol_version',
  UserAgent = 'user_agent'
}

export type Node_Stream_Cursor_Input = {
  initial_value: Node_Stream_Cursor_Value_Input;
  ordering?: InputMaybe<Cursor_Ordering>;
};

export type Node_Stream_Cursor_Value_Input = {
  first_connected_at?: InputMaybe<Scalars['timestamp']>;
  internal_id?: InputMaybe<Scalars['Int']>;
  latest_connection_began_at?: InputMaybe<Scalars['timestamp']>;
  name?: InputMaybe<Scalars['String']>;
  protocol_version?: InputMaybe<Scalars['Int']>;
  user_agent?: InputMaybe<Scalars['String']>;
};

export type Node_Transaction = {
  __typename?: 'node_transaction';
  node: Node;
  node_internal_id: Scalars['Int'];
  transaction: Transaction;
  transaction_internal_id: Scalars['bigint'];
  validated_at?: Maybe<Scalars['timestamp']>;
};

export type Node_Transaction_Aggregate_Order_By = {
  avg?: InputMaybe<Node_Transaction_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Node_Transaction_Max_Order_By>;
  min?: InputMaybe<Node_Transaction_Min_Order_By>;
  stddev?: InputMaybe<Node_Transaction_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Node_Transaction_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Node_Transaction_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Node_Transaction_Sum_Order_By>;
  var_pop?: InputMaybe<Node_Transaction_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Node_Transaction_Var_Samp_Order_By>;
  variance?: InputMaybe<Node_Transaction_Variance_Order_By>;
};

export type Node_Transaction_Avg_Order_By = {
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Node_Transaction_Bool_Exp = {
  _and?: InputMaybe<Array<Node_Transaction_Bool_Exp>>;
  _not?: InputMaybe<Node_Transaction_Bool_Exp>;
  _or?: InputMaybe<Array<Node_Transaction_Bool_Exp>>;
  node?: InputMaybe<Node_Bool_Exp>;
  node_internal_id?: InputMaybe<Int_Comparison_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
  transaction_internal_id?: InputMaybe<Bigint_Comparison_Exp>;
  validated_at?: InputMaybe<Timestamp_Comparison_Exp>;
};

export type Node_Transaction_History = {
  __typename?: 'node_transaction_history';
  internal_id: Scalars['bigint'];
  node: Node;
  node_internal_id: Scalars['Int'];
  replaced_at?: Maybe<Scalars['timestamp']>;
  transaction: Transaction;
  transaction_internal_id: Scalars['bigint'];
  validated_at?: Maybe<Scalars['timestamp']>;
};

export type Node_Transaction_History_Aggregate_Order_By = {
  avg?: InputMaybe<Node_Transaction_History_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Node_Transaction_History_Max_Order_By>;
  min?: InputMaybe<Node_Transaction_History_Min_Order_By>;
  stddev?: InputMaybe<Node_Transaction_History_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Node_Transaction_History_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Node_Transaction_History_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Node_Transaction_History_Sum_Order_By>;
  var_pop?: InputMaybe<Node_Transaction_History_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Node_Transaction_History_Var_Samp_Order_By>;
  variance?: InputMaybe<Node_Transaction_History_Variance_Order_By>;
};

export type Node_Transaction_History_Avg_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Node_Transaction_History_Bool_Exp = {
  _and?: InputMaybe<Array<Node_Transaction_History_Bool_Exp>>;
  _not?: InputMaybe<Node_Transaction_History_Bool_Exp>;
  _or?: InputMaybe<Array<Node_Transaction_History_Bool_Exp>>;
  internal_id?: InputMaybe<Bigint_Comparison_Exp>;
  node?: InputMaybe<Node_Bool_Exp>;
  node_internal_id?: InputMaybe<Int_Comparison_Exp>;
  replaced_at?: InputMaybe<Timestamp_Comparison_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
  transaction_internal_id?: InputMaybe<Bigint_Comparison_Exp>;
  validated_at?: InputMaybe<Timestamp_Comparison_Exp>;
};

export type Node_Transaction_History_Max_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
  replaced_at?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
  validated_at?: InputMaybe<Order_By>;
};

export type Node_Transaction_History_Min_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
  replaced_at?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
  validated_at?: InputMaybe<Order_By>;
};

export type Node_Transaction_History_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  node?: InputMaybe<Node_Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
  replaced_at?: InputMaybe<Order_By>;
  transaction?: InputMaybe<Transaction_Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
  validated_at?: InputMaybe<Order_By>;
};

export enum Node_Transaction_History_Select_Column {
  InternalId = 'internal_id',
  NodeInternalId = 'node_internal_id',
  ReplacedAt = 'replaced_at',
  TransactionInternalId = 'transaction_internal_id',
  ValidatedAt = 'validated_at'
}

export type Node_Transaction_History_Stddev_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Node_Transaction_History_Stddev_Pop_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Node_Transaction_History_Stddev_Samp_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Node_Transaction_History_Stream_Cursor_Input = {
  initial_value: Node_Transaction_History_Stream_Cursor_Value_Input;
  ordering?: InputMaybe<Cursor_Ordering>;
};

export type Node_Transaction_History_Stream_Cursor_Value_Input = {
  internal_id?: InputMaybe<Scalars['bigint']>;
  node_internal_id?: InputMaybe<Scalars['Int']>;
  replaced_at?: InputMaybe<Scalars['timestamp']>;
  transaction_internal_id?: InputMaybe<Scalars['bigint']>;
  validated_at?: InputMaybe<Scalars['timestamp']>;
};

export type Node_Transaction_History_Sum_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Node_Transaction_History_Var_Pop_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Node_Transaction_History_Var_Samp_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Node_Transaction_History_Variance_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Node_Transaction_Max_Order_By = {
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
  validated_at?: InputMaybe<Order_By>;
};

export type Node_Transaction_Min_Order_By = {
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
  validated_at?: InputMaybe<Order_By>;
};

export type Node_Transaction_Order_By = {
  node?: InputMaybe<Node_Order_By>;
  node_internal_id?: InputMaybe<Order_By>;
  transaction?: InputMaybe<Transaction_Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
  validated_at?: InputMaybe<Order_By>;
};

export enum Node_Transaction_Select_Column {
  NodeInternalId = 'node_internal_id',
  TransactionInternalId = 'transaction_internal_id',
  ValidatedAt = 'validated_at'
}

export type Node_Transaction_Stddev_Order_By = {
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Node_Transaction_Stddev_Pop_Order_By = {
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Node_Transaction_Stddev_Samp_Order_By = {
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Node_Transaction_Stream_Cursor_Input = {
  initial_value: Node_Transaction_Stream_Cursor_Value_Input;
  ordering?: InputMaybe<Cursor_Ordering>;
};

export type Node_Transaction_Stream_Cursor_Value_Input = {
  node_internal_id?: InputMaybe<Scalars['Int']>;
  transaction_internal_id?: InputMaybe<Scalars['bigint']>;
  validated_at?: InputMaybe<Scalars['timestamp']>;
};

export type Node_Transaction_Sum_Order_By = {
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Node_Transaction_Var_Pop_Order_By = {
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Node_Transaction_Var_Samp_Order_By = {
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export type Node_Transaction_Variance_Order_By = {
  node_internal_id?: InputMaybe<Order_By>;
  transaction_internal_id?: InputMaybe<Order_By>;
};

export enum Order_By {
  Asc = 'asc',
  AscNullsFirst = 'asc_nulls_first',
  AscNullsLast = 'asc_nulls_last',
  Desc = 'desc',
  DescNullsFirst = 'desc_nulls_first',
  DescNullsLast = 'desc_nulls_last'
}

export type Output = {
  __typename?: 'output';
  fungible_token_amount?: Maybe<Scalars['bigint']>;
  locking_bytecode: Scalars['bytea'];
  locking_bytecode_pattern?: Maybe<Scalars['String']>;
  nonfungible_token_capability?: Maybe<Scalars['enum_nonfungible_token_capability']>;
  nonfungible_token_commitment?: Maybe<Scalars['bytea']>;
  output_index: Scalars['bigint'];
  spent_by: Array<Input>;
  token_category?: Maybe<Scalars['bytea']>;
  transaction: Transaction;
  transaction_hash: Scalars['bytea'];
  value_satoshis: Scalars['bigint'];
};


export type OutputSpent_ByArgs = {
  distinct_on?: InputMaybe<Array<Input_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Input_Order_By>>;
  where?: InputMaybe<Input_Bool_Exp>;
};

export type Output_Aggregate_Order_By = {
  avg?: InputMaybe<Output_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Output_Max_Order_By>;
  min?: InputMaybe<Output_Min_Order_By>;
  stddev?: InputMaybe<Output_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Output_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Output_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Output_Sum_Order_By>;
  var_pop?: InputMaybe<Output_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Output_Var_Samp_Order_By>;
  variance?: InputMaybe<Output_Variance_Order_By>;
};

export type Output_Avg_Order_By = {
  fungible_token_amount?: InputMaybe<Order_By>;
  output_index?: InputMaybe<Order_By>;
  value_satoshis?: InputMaybe<Order_By>;
};

export type Output_Bool_Exp = {
  _and?: InputMaybe<Array<Output_Bool_Exp>>;
  _not?: InputMaybe<Output_Bool_Exp>;
  _or?: InputMaybe<Array<Output_Bool_Exp>>;
  fungible_token_amount?: InputMaybe<Bigint_Comparison_Exp>;
  locking_bytecode?: InputMaybe<Bytea_Comparison_Exp>;
  locking_bytecode_pattern?: InputMaybe<String_Comparison_Exp>;
  nonfungible_token_capability?: InputMaybe<Enum_Nonfungible_Token_Capability_Comparison_Exp>;
  nonfungible_token_commitment?: InputMaybe<Bytea_Comparison_Exp>;
  output_index?: InputMaybe<Bigint_Comparison_Exp>;
  spent_by?: InputMaybe<Input_Bool_Exp>;
  token_category?: InputMaybe<Bytea_Comparison_Exp>;
  transaction?: InputMaybe<Transaction_Bool_Exp>;
  transaction_hash?: InputMaybe<Bytea_Comparison_Exp>;
  value_satoshis?: InputMaybe<Bigint_Comparison_Exp>;
};

export type Output_Max_Order_By = {
  fungible_token_amount?: InputMaybe<Order_By>;
  nonfungible_token_capability?: InputMaybe<Order_By>;
  output_index?: InputMaybe<Order_By>;
  value_satoshis?: InputMaybe<Order_By>;
};

export type Output_Min_Order_By = {
  fungible_token_amount?: InputMaybe<Order_By>;
  nonfungible_token_capability?: InputMaybe<Order_By>;
  output_index?: InputMaybe<Order_By>;
  value_satoshis?: InputMaybe<Order_By>;
};

export type Output_Order_By = {
  fungible_token_amount?: InputMaybe<Order_By>;
  locking_bytecode?: InputMaybe<Order_By>;
  locking_bytecode_pattern?: InputMaybe<Order_By>;
  nonfungible_token_capability?: InputMaybe<Order_By>;
  nonfungible_token_commitment?: InputMaybe<Order_By>;
  output_index?: InputMaybe<Order_By>;
  spent_by_aggregate?: InputMaybe<Input_Aggregate_Order_By>;
  token_category?: InputMaybe<Order_By>;
  transaction?: InputMaybe<Transaction_Order_By>;
  transaction_hash?: InputMaybe<Order_By>;
  value_satoshis?: InputMaybe<Order_By>;
};

export enum Output_Select_Column {
  FungibleTokenAmount = 'fungible_token_amount',
  LockingBytecode = 'locking_bytecode',
  NonfungibleTokenCapability = 'nonfungible_token_capability',
  NonfungibleTokenCommitment = 'nonfungible_token_commitment',
  OutputIndex = 'output_index',
  TokenCategory = 'token_category',
  TransactionHash = 'transaction_hash',
  ValueSatoshis = 'value_satoshis'
}

export type Output_Stddev_Order_By = {
  fungible_token_amount?: InputMaybe<Order_By>;
  output_index?: InputMaybe<Order_By>;
  value_satoshis?: InputMaybe<Order_By>;
};

export type Output_Stddev_Pop_Order_By = {
  fungible_token_amount?: InputMaybe<Order_By>;
  output_index?: InputMaybe<Order_By>;
  value_satoshis?: InputMaybe<Order_By>;
};

export type Output_Stddev_Samp_Order_By = {
  fungible_token_amount?: InputMaybe<Order_By>;
  output_index?: InputMaybe<Order_By>;
  value_satoshis?: InputMaybe<Order_By>;
};

export type Output_Stream_Cursor_Input = {
  initial_value: Output_Stream_Cursor_Value_Input;
  ordering?: InputMaybe<Cursor_Ordering>;
};

export type Output_Stream_Cursor_Value_Input = {
  fungible_token_amount?: InputMaybe<Scalars['bigint']>;
  locking_bytecode?: InputMaybe<Scalars['bytea']>;
  nonfungible_token_capability?: InputMaybe<Scalars['enum_nonfungible_token_capability']>;
  nonfungible_token_commitment?: InputMaybe<Scalars['bytea']>;
  output_index?: InputMaybe<Scalars['bigint']>;
  token_category?: InputMaybe<Scalars['bytea']>;
  transaction_hash?: InputMaybe<Scalars['bytea']>;
  value_satoshis?: InputMaybe<Scalars['bigint']>;
};

export type Output_Sum_Order_By = {
  fungible_token_amount?: InputMaybe<Order_By>;
  output_index?: InputMaybe<Order_By>;
  value_satoshis?: InputMaybe<Order_By>;
};

export type Output_Var_Pop_Order_By = {
  fungible_token_amount?: InputMaybe<Order_By>;
  output_index?: InputMaybe<Order_By>;
  value_satoshis?: InputMaybe<Order_By>;
};

export type Output_Var_Samp_Order_By = {
  fungible_token_amount?: InputMaybe<Order_By>;
  output_index?: InputMaybe<Order_By>;
  value_satoshis?: InputMaybe<Order_By>;
};

export type Output_Variance_Order_By = {
  fungible_token_amount?: InputMaybe<Order_By>;
  output_index?: InputMaybe<Order_By>;
  value_satoshis?: InputMaybe<Order_By>;
};

export type Query_Root = {
  __typename?: 'query_root';
  authchain_migrations_view: Array<Authchain_Migrations_View>;
  authchain_view: Array<Authchain_View>;
  block: Array<Block>;
  block_by_pk?: Maybe<Block>;
  block_transaction: Array<Block_Transaction>;
  block_transaction_by_pk?: Maybe<Block_Transaction>;
  input: Array<Input>;
  input_by_pk?: Maybe<Input>;
  node: Array<Node>;
  node_block: Array<Node_Block>;
  node_block_by_pk?: Maybe<Node_Block>;
  node_block_history: Array<Node_Block_History>;
  node_block_history_by_pk?: Maybe<Node_Block_History>;
  node_by_pk?: Maybe<Node>;
  node_transaction: Array<Node_Transaction>;
  node_transaction_by_pk?: Maybe<Node_Transaction>;
  node_transaction_history: Array<Node_Transaction_History>;
  output: Array<Output>;
  output_by_pk?: Maybe<Output>;
  search_output: Array<Output>;
  search_output_prefix: Array<Output>;
  transaction: Array<Transaction>;
  transaction_by_pk?: Maybe<Transaction>;
};


export type Query_RootAuthchain_Migrations_ViewArgs = {
  distinct_on?: InputMaybe<Array<Authchain_Migrations_View_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Authchain_Migrations_View_Order_By>>;
  where?: InputMaybe<Authchain_Migrations_View_Bool_Exp>;
};


export type Query_RootAuthchain_ViewArgs = {
  distinct_on?: InputMaybe<Array<Authchain_View_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Authchain_View_Order_By>>;
  where?: InputMaybe<Authchain_View_Bool_Exp>;
};


export type Query_RootBlockArgs = {
  distinct_on?: InputMaybe<Array<Block_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Block_Order_By>>;
  where?: InputMaybe<Block_Bool_Exp>;
};


export type Query_RootBlock_By_PkArgs = {
  internal_id: Scalars['bigint'];
};


export type Query_RootBlock_TransactionArgs = {
  distinct_on?: InputMaybe<Array<Block_Transaction_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Block_Transaction_Order_By>>;
  where?: InputMaybe<Block_Transaction_Bool_Exp>;
};


export type Query_RootBlock_Transaction_By_PkArgs = {
  block_internal_id: Scalars['bigint'];
  transaction_internal_id: Scalars['bigint'];
};


export type Query_RootInputArgs = {
  distinct_on?: InputMaybe<Array<Input_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Input_Order_By>>;
  where?: InputMaybe<Input_Bool_Exp>;
};


export type Query_RootInput_By_PkArgs = {
  input_index: Scalars['bigint'];
  transaction_internal_id: Scalars['bigint'];
};


export type Query_RootNodeArgs = {
  distinct_on?: InputMaybe<Array<Node_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Node_Order_By>>;
  where?: InputMaybe<Node_Bool_Exp>;
};


export type Query_RootNode_BlockArgs = {
  distinct_on?: InputMaybe<Array<Node_Block_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Node_Block_Order_By>>;
  where?: InputMaybe<Node_Block_Bool_Exp>;
};


export type Query_RootNode_Block_By_PkArgs = {
  block_internal_id: Scalars['bigint'];
  node_internal_id: Scalars['Int'];
};


export type Query_RootNode_Block_HistoryArgs = {
  distinct_on?: InputMaybe<Array<Node_Block_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Node_Block_History_Order_By>>;
  where?: InputMaybe<Node_Block_History_Bool_Exp>;
};


export type Query_RootNode_Block_History_By_PkArgs = {
  internal_id: Scalars['bigint'];
};


export type Query_RootNode_By_PkArgs = {
  internal_id: Scalars['Int'];
};


export type Query_RootNode_TransactionArgs = {
  distinct_on?: InputMaybe<Array<Node_Transaction_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Node_Transaction_Order_By>>;
  where?: InputMaybe<Node_Transaction_Bool_Exp>;
};


export type Query_RootNode_Transaction_By_PkArgs = {
  node_internal_id: Scalars['Int'];
  transaction_internal_id: Scalars['bigint'];
};


export type Query_RootNode_Transaction_HistoryArgs = {
  distinct_on?: InputMaybe<Array<Node_Transaction_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Node_Transaction_History_Order_By>>;
  where?: InputMaybe<Node_Transaction_History_Bool_Exp>;
};


export type Query_RootOutputArgs = {
  distinct_on?: InputMaybe<Array<Output_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Output_Order_By>>;
  where?: InputMaybe<Output_Bool_Exp>;
};


export type Query_RootOutput_By_PkArgs = {
  output_index: Scalars['bigint'];
  transaction_hash: Scalars['bytea'];
};


export type Query_RootSearch_OutputArgs = {
  args: Search_Output_Args;
  distinct_on?: InputMaybe<Array<Output_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Output_Order_By>>;
  where?: InputMaybe<Output_Bool_Exp>;
};


export type Query_RootSearch_Output_PrefixArgs = {
  args: Search_Output_Prefix_Args;
  distinct_on?: InputMaybe<Array<Output_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Output_Order_By>>;
  where?: InputMaybe<Output_Bool_Exp>;
};


export type Query_RootTransactionArgs = {
  distinct_on?: InputMaybe<Array<Transaction_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Transaction_Order_By>>;
  where?: InputMaybe<Transaction_Bool_Exp>;
};


export type Query_RootTransaction_By_PkArgs = {
  internal_id: Scalars['bigint'];
};

export type Search_Output_Args = {
  locking_bytecode_hex?: InputMaybe<Scalars['_text']>;
};

export type Search_Output_Prefix_Args = {
  locking_bytecode_prefix_hex?: InputMaybe<Scalars['String']>;
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  authchain_migrations_view: Array<Authchain_Migrations_View>;
  authchain_migrations_view_stream: Array<Authchain_Migrations_View>;
  authchain_view: Array<Authchain_View>;
  authchain_view_stream: Array<Authchain_View>;
  block: Array<Block>;
  block_by_pk?: Maybe<Block>;
  block_stream: Array<Block>;
  block_transaction: Array<Block_Transaction>;
  block_transaction_by_pk?: Maybe<Block_Transaction>;
  block_transaction_stream: Array<Block_Transaction>;
  input: Array<Input>;
  input_by_pk?: Maybe<Input>;
  input_stream: Array<Input>;
  node: Array<Node>;
  node_block: Array<Node_Block>;
  node_block_by_pk?: Maybe<Node_Block>;
  node_block_history: Array<Node_Block_History>;
  node_block_history_by_pk?: Maybe<Node_Block_History>;
  node_block_history_stream: Array<Node_Block_History>;
  node_block_stream: Array<Node_Block>;
  node_by_pk?: Maybe<Node>;
  node_stream: Array<Node>;
  node_transaction: Array<Node_Transaction>;
  node_transaction_by_pk?: Maybe<Node_Transaction>;
  node_transaction_history: Array<Node_Transaction_History>;
  node_transaction_history_stream: Array<Node_Transaction_History>;
  node_transaction_stream: Array<Node_Transaction>;
  output: Array<Output>;
  output_by_pk?: Maybe<Output>;
  output_stream: Array<Output>;
  search_output: Array<Output>;
  search_output_prefix: Array<Output>;
  transaction: Array<Transaction>;
  transaction_by_pk?: Maybe<Transaction>;
  transaction_stream: Array<Transaction>;
};


export type Subscription_RootAuthchain_Migrations_ViewArgs = {
  distinct_on?: InputMaybe<Array<Authchain_Migrations_View_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Authchain_Migrations_View_Order_By>>;
  where?: InputMaybe<Authchain_Migrations_View_Bool_Exp>;
};


export type Subscription_RootAuthchain_Migrations_View_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<InputMaybe<Authchain_Migrations_View_Stream_Cursor_Input>>;
  where?: InputMaybe<Authchain_Migrations_View_Bool_Exp>;
};


export type Subscription_RootAuthchain_ViewArgs = {
  distinct_on?: InputMaybe<Array<Authchain_View_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Authchain_View_Order_By>>;
  where?: InputMaybe<Authchain_View_Bool_Exp>;
};


export type Subscription_RootAuthchain_View_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<InputMaybe<Authchain_View_Stream_Cursor_Input>>;
  where?: InputMaybe<Authchain_View_Bool_Exp>;
};


export type Subscription_RootBlockArgs = {
  distinct_on?: InputMaybe<Array<Block_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Block_Order_By>>;
  where?: InputMaybe<Block_Bool_Exp>;
};


export type Subscription_RootBlock_By_PkArgs = {
  internal_id: Scalars['bigint'];
};


export type Subscription_RootBlock_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<InputMaybe<Block_Stream_Cursor_Input>>;
  where?: InputMaybe<Block_Bool_Exp>;
};


export type Subscription_RootBlock_TransactionArgs = {
  distinct_on?: InputMaybe<Array<Block_Transaction_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Block_Transaction_Order_By>>;
  where?: InputMaybe<Block_Transaction_Bool_Exp>;
};


export type Subscription_RootBlock_Transaction_By_PkArgs = {
  block_internal_id: Scalars['bigint'];
  transaction_internal_id: Scalars['bigint'];
};


export type Subscription_RootBlock_Transaction_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<InputMaybe<Block_Transaction_Stream_Cursor_Input>>;
  where?: InputMaybe<Block_Transaction_Bool_Exp>;
};


export type Subscription_RootInputArgs = {
  distinct_on?: InputMaybe<Array<Input_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Input_Order_By>>;
  where?: InputMaybe<Input_Bool_Exp>;
};


export type Subscription_RootInput_By_PkArgs = {
  input_index: Scalars['bigint'];
  transaction_internal_id: Scalars['bigint'];
};


export type Subscription_RootInput_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<InputMaybe<Input_Stream_Cursor_Input>>;
  where?: InputMaybe<Input_Bool_Exp>;
};


export type Subscription_RootNodeArgs = {
  distinct_on?: InputMaybe<Array<Node_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Node_Order_By>>;
  where?: InputMaybe<Node_Bool_Exp>;
};


export type Subscription_RootNode_BlockArgs = {
  distinct_on?: InputMaybe<Array<Node_Block_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Node_Block_Order_By>>;
  where?: InputMaybe<Node_Block_Bool_Exp>;
};


export type Subscription_RootNode_Block_By_PkArgs = {
  block_internal_id: Scalars['bigint'];
  node_internal_id: Scalars['Int'];
};


export type Subscription_RootNode_Block_HistoryArgs = {
  distinct_on?: InputMaybe<Array<Node_Block_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Node_Block_History_Order_By>>;
  where?: InputMaybe<Node_Block_History_Bool_Exp>;
};


export type Subscription_RootNode_Block_History_By_PkArgs = {
  internal_id: Scalars['bigint'];
};


export type Subscription_RootNode_Block_History_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<InputMaybe<Node_Block_History_Stream_Cursor_Input>>;
  where?: InputMaybe<Node_Block_History_Bool_Exp>;
};


export type Subscription_RootNode_Block_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<InputMaybe<Node_Block_Stream_Cursor_Input>>;
  where?: InputMaybe<Node_Block_Bool_Exp>;
};


export type Subscription_RootNode_By_PkArgs = {
  internal_id: Scalars['Int'];
};


export type Subscription_RootNode_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<InputMaybe<Node_Stream_Cursor_Input>>;
  where?: InputMaybe<Node_Bool_Exp>;
};


export type Subscription_RootNode_TransactionArgs = {
  distinct_on?: InputMaybe<Array<Node_Transaction_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Node_Transaction_Order_By>>;
  where?: InputMaybe<Node_Transaction_Bool_Exp>;
};


export type Subscription_RootNode_Transaction_By_PkArgs = {
  node_internal_id: Scalars['Int'];
  transaction_internal_id: Scalars['bigint'];
};


export type Subscription_RootNode_Transaction_HistoryArgs = {
  distinct_on?: InputMaybe<Array<Node_Transaction_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Node_Transaction_History_Order_By>>;
  where?: InputMaybe<Node_Transaction_History_Bool_Exp>;
};


export type Subscription_RootNode_Transaction_History_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<InputMaybe<Node_Transaction_History_Stream_Cursor_Input>>;
  where?: InputMaybe<Node_Transaction_History_Bool_Exp>;
};


export type Subscription_RootNode_Transaction_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<InputMaybe<Node_Transaction_Stream_Cursor_Input>>;
  where?: InputMaybe<Node_Transaction_Bool_Exp>;
};


export type Subscription_RootOutputArgs = {
  distinct_on?: InputMaybe<Array<Output_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Output_Order_By>>;
  where?: InputMaybe<Output_Bool_Exp>;
};


export type Subscription_RootOutput_By_PkArgs = {
  output_index: Scalars['bigint'];
  transaction_hash: Scalars['bytea'];
};


export type Subscription_RootOutput_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<InputMaybe<Output_Stream_Cursor_Input>>;
  where?: InputMaybe<Output_Bool_Exp>;
};


export type Subscription_RootSearch_OutputArgs = {
  args: Search_Output_Args;
  distinct_on?: InputMaybe<Array<Output_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Output_Order_By>>;
  where?: InputMaybe<Output_Bool_Exp>;
};


export type Subscription_RootSearch_Output_PrefixArgs = {
  args: Search_Output_Prefix_Args;
  distinct_on?: InputMaybe<Array<Output_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Output_Order_By>>;
  where?: InputMaybe<Output_Bool_Exp>;
};


export type Subscription_RootTransactionArgs = {
  distinct_on?: InputMaybe<Array<Transaction_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Transaction_Order_By>>;
  where?: InputMaybe<Transaction_Bool_Exp>;
};


export type Subscription_RootTransaction_By_PkArgs = {
  internal_id: Scalars['bigint'];
};


export type Subscription_RootTransaction_StreamArgs = {
  batch_size: Scalars['Int'];
  cursor: Array<InputMaybe<Transaction_Stream_Cursor_Input>>;
  where?: InputMaybe<Transaction_Bool_Exp>;
};

export type Timestamp_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamp']>;
  _gt?: InputMaybe<Scalars['timestamp']>;
  _gte?: InputMaybe<Scalars['timestamp']>;
  _in?: InputMaybe<Array<Scalars['timestamp']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['timestamp']>;
  _lte?: InputMaybe<Scalars['timestamp']>;
  _neq?: InputMaybe<Scalars['timestamp']>;
  _nin?: InputMaybe<Array<Scalars['timestamp']>>;
};

export type Transaction = {
  __typename?: 'transaction';
  authchains: Array<Authchain_View>;
  block_inclusions: Array<Block_Transaction>;
  data_carrier_outputs?: Maybe<Array<Output>>;
  encoded_hex?: Maybe<Scalars['String']>;
  fee_satoshis?: Maybe<Scalars['bigint']>;
  hash: Scalars['bytea'];
  identity_output?: Maybe<Array<Output>>;
  input_count?: Maybe<Scalars['bigint']>;
  input_outpoint_transactions: Array<Input>;
  input_value_satoshis?: Maybe<Scalars['bigint']>;
  inputs: Array<Input>;
  internal_id: Scalars['bigint'];
  is_coinbase: Scalars['Boolean'];
  locktime: Scalars['bigint'];
  node_validation_timeline: Array<Node_Transaction_History>;
  node_validations: Array<Node_Transaction>;
  output_count?: Maybe<Scalars['bigint']>;
  output_value_satoshis?: Maybe<Scalars['bigint']>;
  outputs: Array<Output>;
  signing_output?: Maybe<Array<Output>>;
  size_bytes: Scalars['bigint'];
  version: Scalars['bigint'];
};


export type TransactionAuthchainsArgs = {
  distinct_on?: InputMaybe<Array<Authchain_View_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Authchain_View_Order_By>>;
  where?: InputMaybe<Authchain_View_Bool_Exp>;
};


export type TransactionBlock_InclusionsArgs = {
  distinct_on?: InputMaybe<Array<Block_Transaction_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Block_Transaction_Order_By>>;
  where?: InputMaybe<Block_Transaction_Bool_Exp>;
};


export type TransactionData_Carrier_OutputsArgs = {
  distinct_on?: InputMaybe<Array<Output_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Output_Order_By>>;
  where?: InputMaybe<Output_Bool_Exp>;
};


export type TransactionIdentity_OutputArgs = {
  distinct_on?: InputMaybe<Array<Output_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Output_Order_By>>;
  where?: InputMaybe<Output_Bool_Exp>;
};


export type TransactionInput_Outpoint_TransactionsArgs = {
  distinct_on?: InputMaybe<Array<Input_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Input_Order_By>>;
  where?: InputMaybe<Input_Bool_Exp>;
};


export type TransactionInputsArgs = {
  distinct_on?: InputMaybe<Array<Input_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Input_Order_By>>;
  where?: InputMaybe<Input_Bool_Exp>;
};


export type TransactionNode_Validation_TimelineArgs = {
  distinct_on?: InputMaybe<Array<Node_Transaction_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Node_Transaction_History_Order_By>>;
  where?: InputMaybe<Node_Transaction_History_Bool_Exp>;
};


export type TransactionNode_ValidationsArgs = {
  distinct_on?: InputMaybe<Array<Node_Transaction_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Node_Transaction_Order_By>>;
  where?: InputMaybe<Node_Transaction_Bool_Exp>;
};


export type TransactionOutputsArgs = {
  distinct_on?: InputMaybe<Array<Output_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Output_Order_By>>;
  where?: InputMaybe<Output_Bool_Exp>;
};


export type TransactionSigning_OutputArgs = {
  distinct_on?: InputMaybe<Array<Output_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Output_Order_By>>;
  where?: InputMaybe<Output_Bool_Exp>;
};

export type Transaction_Aggregate_Order_By = {
  avg?: InputMaybe<Transaction_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Transaction_Max_Order_By>;
  min?: InputMaybe<Transaction_Min_Order_By>;
  stddev?: InputMaybe<Transaction_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Transaction_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Transaction_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Transaction_Sum_Order_By>;
  var_pop?: InputMaybe<Transaction_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Transaction_Var_Samp_Order_By>;
  variance?: InputMaybe<Transaction_Variance_Order_By>;
};

export type Transaction_Avg_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  locktime?: InputMaybe<Order_By>;
  size_bytes?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

export type Transaction_Bool_Exp = {
  _and?: InputMaybe<Array<Transaction_Bool_Exp>>;
  _not?: InputMaybe<Transaction_Bool_Exp>;
  _or?: InputMaybe<Array<Transaction_Bool_Exp>>;
  authchains?: InputMaybe<Authchain_View_Bool_Exp>;
  block_inclusions?: InputMaybe<Block_Transaction_Bool_Exp>;
  data_carrier_outputs?: InputMaybe<Output_Bool_Exp>;
  encoded_hex?: InputMaybe<String_Comparison_Exp>;
  fee_satoshis?: InputMaybe<Bigint_Comparison_Exp>;
  hash?: InputMaybe<Bytea_Comparison_Exp>;
  identity_output?: InputMaybe<Output_Bool_Exp>;
  input_count?: InputMaybe<Bigint_Comparison_Exp>;
  input_outpoint_transactions?: InputMaybe<Input_Bool_Exp>;
  input_value_satoshis?: InputMaybe<Bigint_Comparison_Exp>;
  inputs?: InputMaybe<Input_Bool_Exp>;
  internal_id?: InputMaybe<Bigint_Comparison_Exp>;
  is_coinbase?: InputMaybe<Boolean_Comparison_Exp>;
  locktime?: InputMaybe<Bigint_Comparison_Exp>;
  node_validation_timeline?: InputMaybe<Node_Transaction_History_Bool_Exp>;
  node_validations?: InputMaybe<Node_Transaction_Bool_Exp>;
  output_count?: InputMaybe<Bigint_Comparison_Exp>;
  output_value_satoshis?: InputMaybe<Bigint_Comparison_Exp>;
  outputs?: InputMaybe<Output_Bool_Exp>;
  signing_output?: InputMaybe<Output_Bool_Exp>;
  size_bytes?: InputMaybe<Bigint_Comparison_Exp>;
  version?: InputMaybe<Bigint_Comparison_Exp>;
};

export type Transaction_Max_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  locktime?: InputMaybe<Order_By>;
  size_bytes?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

export type Transaction_Min_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  locktime?: InputMaybe<Order_By>;
  size_bytes?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

export type Transaction_Order_By = {
  authchains_aggregate?: InputMaybe<Authchain_View_Aggregate_Order_By>;
  block_inclusions_aggregate?: InputMaybe<Block_Transaction_Aggregate_Order_By>;
  data_carrier_outputs_aggregate?: InputMaybe<Output_Aggregate_Order_By>;
  encoded_hex?: InputMaybe<Order_By>;
  fee_satoshis?: InputMaybe<Order_By>;
  hash?: InputMaybe<Order_By>;
  identity_output_aggregate?: InputMaybe<Output_Aggregate_Order_By>;
  input_count?: InputMaybe<Order_By>;
  input_outpoint_transactions_aggregate?: InputMaybe<Input_Aggregate_Order_By>;
  input_value_satoshis?: InputMaybe<Order_By>;
  inputs_aggregate?: InputMaybe<Input_Aggregate_Order_By>;
  internal_id?: InputMaybe<Order_By>;
  is_coinbase?: InputMaybe<Order_By>;
  locktime?: InputMaybe<Order_By>;
  node_validation_timeline_aggregate?: InputMaybe<Node_Transaction_History_Aggregate_Order_By>;
  node_validations_aggregate?: InputMaybe<Node_Transaction_Aggregate_Order_By>;
  output_count?: InputMaybe<Order_By>;
  output_value_satoshis?: InputMaybe<Order_By>;
  outputs_aggregate?: InputMaybe<Output_Aggregate_Order_By>;
  signing_output_aggregate?: InputMaybe<Output_Aggregate_Order_By>;
  size_bytes?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

export enum Transaction_Select_Column {
  Hash = 'hash',
  InternalId = 'internal_id',
  IsCoinbase = 'is_coinbase',
  Locktime = 'locktime',
  SizeBytes = 'size_bytes',
  Version = 'version'
}

export type Transaction_Stddev_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  locktime?: InputMaybe<Order_By>;
  size_bytes?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

export type Transaction_Stddev_Pop_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  locktime?: InputMaybe<Order_By>;
  size_bytes?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

export type Transaction_Stddev_Samp_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  locktime?: InputMaybe<Order_By>;
  size_bytes?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

export type Transaction_Stream_Cursor_Input = {
  initial_value: Transaction_Stream_Cursor_Value_Input;
  ordering?: InputMaybe<Cursor_Ordering>;
};

export type Transaction_Stream_Cursor_Value_Input = {
  hash?: InputMaybe<Scalars['bytea']>;
  internal_id?: InputMaybe<Scalars['bigint']>;
  is_coinbase?: InputMaybe<Scalars['Boolean']>;
  locktime?: InputMaybe<Scalars['bigint']>;
  size_bytes?: InputMaybe<Scalars['bigint']>;
  version?: InputMaybe<Scalars['bigint']>;
};

export type Transaction_Sum_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  locktime?: InputMaybe<Order_By>;
  size_bytes?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

export type Transaction_Var_Pop_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  locktime?: InputMaybe<Order_By>;
  size_bytes?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

export type Transaction_Var_Samp_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  locktime?: InputMaybe<Order_By>;
  size_bytes?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

export type Transaction_Variance_Order_By = {
  internal_id?: InputMaybe<Order_By>;
  locktime?: InputMaybe<Order_By>;
  size_bytes?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
};

export type GetBlockQueryVariables = Exact<{
  network?: InputMaybe<Scalars['String']>;
  height?: InputMaybe<Scalars['bigint']>;
  hash?: InputMaybe<Scalars['bytea']>;
}>;


export type GetBlockQuery = { __typename?: 'query_root', block: Array<{ __typename?: 'block', height: any, transaction_count?: any | null, input_count?: any | null, input_value_satoshis?: any | null, fee_satoshis?: any | null, generated_value_satoshis?: any | null }> };

export type GetTxQueryVariables = Exact<{
  network?: InputMaybe<Scalars['String']>;
  hash?: InputMaybe<Scalars['bytea']>;
}>;


export type GetTxQuery = { __typename?: 'query_root', block_transaction: Array<{ __typename?: 'block_transaction', block: { __typename?: 'block', height: any, timestamp: any }, transaction: { __typename?: 'transaction', hash: string, input_value_satoshis?: any | null, output_value_satoshis?: any | null, block_inclusions: Array<{ __typename?: 'block_transaction', block: { __typename?: 'block', height: any } }> } }> };

export type LastTransactionQueryVariables = Exact<{
  network?: InputMaybe<Scalars['String']>;
}>;


export type LastTransactionQuery = { __typename?: 'query_root', block: Array<{ __typename?: 'block', height: any, transactions: Array<{ __typename?: 'block_transaction', transaction: { __typename?: 'transaction', hash: string, input_value_satoshis?: any | null, output_value_satoshis?: any | null } }> }> };

export type GetLastBlockSubscriptionVariables = Exact<{
  network?: InputMaybe<Scalars['String']>;
}>;


export type GetLastBlockSubscription = { __typename?: 'subscription_root', node_block: Array<{ __typename?: 'node_block', block: { __typename?: 'block', height: any } }> };


export const GetBlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"network"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"height"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"bigint"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hash"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"bytea"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"IntValue","value":"0"}},{"kind":"Argument","name":{"kind":"Name","value":"order_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"height"},"value":{"kind":"EnumValue","value":"desc"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"accepted_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"node"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"name"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_regex"},"value":{"kind":"Variable","name":{"kind":"Name","value":"network"}}}]}}]}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"_or"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"height"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"height"}}}]}}]},{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"hash"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hash"}}}]}}]}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"transaction_count"}},{"kind":"Field","name":{"kind":"Name","value":"input_count"}},{"kind":"Field","name":{"kind":"Name","value":"input_value_satoshis"}},{"kind":"Field","name":{"kind":"Name","value":"fee_satoshis"}},{"kind":"Field","name":{"kind":"Name","value":"generated_value_satoshis"}}]}}]}}]} as unknown as DocumentNode<GetBlockQuery, GetBlockQueryVariables>;
export const GetTxDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTx"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"network"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hash"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"bytea"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block_transaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"transaction"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"block_inclusions"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"block"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"accepted_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"node"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"name"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_regex"},"value":{"kind":"Variable","name":{"kind":"Name","value":"network"}}}]}}]}}]}}]}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"hash"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hash"}}}]}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"input_value_satoshis"}},{"kind":"Field","name":{"kind":"Name","value":"output_value_satoshis"}},{"kind":"Field","name":{"kind":"Name","value":"block_inclusions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetTxQuery, GetTxQueryVariables>;
export const LastTransactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LastTransaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"network"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"order_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"height"},"value":{"kind":"EnumValue","value":"desc"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"accepted_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"node"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"name"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_regex"},"value":{"kind":"Variable","name":{"kind":"Name","value":"network"}}}]}}]}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"transactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"10"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"input_value_satoshis"}},{"kind":"Field","name":{"kind":"Name","value":"output_value_satoshis"}}]}}]}}]}}]}}]} as unknown as DocumentNode<LastTransactionQuery, LastTransactionQueryVariables>;
export const GetLastBlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"GetLastBlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"network"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node_block"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"node"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"name"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_regex"},"value":{"kind":"StringValue","value":"mainnet","block":false}}]}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"order_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"block"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"height"},"value":{"kind":"EnumValue","value":"desc"}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}}]}}]}}]}}]} as unknown as DocumentNode<GetLastBlockSubscription, GetLastBlockSubscriptionVariables>;