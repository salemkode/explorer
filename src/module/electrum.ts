import { ElectrumClient, type SubscribeCallback } from "electrum-cash";

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

export const electrum = new ElectrumClient(
  "mainnet-js-node",
  "1.5",
  "bch.imaginary.cash",
  50004,
  "wss"
);

await electrum.connect().catch(console.log);
