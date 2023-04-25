import type { SubscribeCallback, ElectrumClient } from "electrum-cash";
import type { Scalars } from "~/graphql/graphql";

export type bigNum = number | string | BigNumber;

export type bytea = `\\x${string}`;

export class ElectrumClient extends ElectrumClient {
  request<T>(method: string, ...parameters: string[]): Promise<Error | T>;

  subscribe(
    callback: SubscribeCallback,
    method: string,
    ...parameters: string[]
  ): Promise<true>;
}

export interface tableColumn {
  text: string | number;
  short?: boolean;
  copy?: boolean;
  url?: string;
  token?: {
    category: string;
    url: string;
  };
}

export interface contentWarpItem {
  title: string;
  text?: string | number | null;
  copy?: boolean;
  url?: string;
  warp?: boolean;
}

export type addressInfo = {
  firstTx: string;
  lastTx: string;
  txCount: string;
};

export type Utxo = {
  token_category?: bytea | null;
  fungible_token_amount?: string | null;
  nonfungible_token_capability?: string | null;
  nonfungible_token_commitment?: bytea | null;
  locking_bytecode: string;
  value_satoshis: string;
};

export type tokenCapability = Scalars["enum_nonfungible_token_capability"];

export * from "./bcmr-v2.schema";
