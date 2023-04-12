import {
  ElectrumClient as ElectrumClientOriginal,
  SubscribeCallback,
} from "electrum-cash";
import { Scalars } from "~/graphql/graphql";

export class ElectrumClient extends ElectrumClientOriginal {
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

export interface contentWarp {
  title: string;
  text?: string | number;
  copy?: boolean;
  url?: string;
}

export type addressInfo = {
  firstTx: string;
  lastTx: string;
  txCount: string;
};

export type tokenCapability = Scalars["enum_nonfungible_token_capability"];

export * from "./bcmr-v1.schema";
