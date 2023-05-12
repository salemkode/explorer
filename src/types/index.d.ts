import type { SubscribeCallback } from "electrum-cash";
import type { Scalars } from "~/graphql/graphql";
export type bigNum = number | string | BigNumber;
export type bytea = `\\x${string}`;

export type RegistryProvider = {
  name: string;
  url: string;
  enable: boolean;
  default: boolean;
};

export interface tableColumn {
  text: string | number;
  short?: boolean;
  copy?: boolean;
  url?: string;
  token?: {
    category: string;
    icon: string;
  };
}

export interface contentWarpItem {
  title: string;
  text?: string | number | null;
  copy?: boolean;
  url?: string;
  warp?: boolean;
}

export interface addressInfo {
  firstTx: string;
  lastTx: string;
  txCount: string;
}

export interface Utxo {
  token_category?: bytea | null;
  fungible_token_amount?: string | null;
  nonfungible_token_capability?: string | null;
  nonfungible_token_commitment?: bytea | null;
  locking_bytecode: string;
  value_satoshis: string;
}

export type tokenCapability = Scalars["enum_nonfungible_token_capability"];

export * from "./bcmr-v2.schema";

declare module "electrum-cash" {
  type balance = { confirmed: number; unconfirmed: number };
  type history = {
    height: number;
    tx_hash: string;
  }[];

  class ElectrumClient {
    request(
      method: "blockchain.address.get_balance",
      address: string
    ): Promise<Error | balance>;

    request(
      method: "blockchain.address.get_history",
      address: string
    ): Promise<Error | history>;

    request<T>(method: string, ...parameters: string[]): Promise<Error | T>;

    subscribe(
      callback: SubscribeCallback,
      method: string,
      ...parameters: string[]
    ): Promise<true>;
  }
}

