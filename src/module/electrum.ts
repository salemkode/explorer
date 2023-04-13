import { ElectrumClient } from "electrum-cash";
import type { ElectrumClient as ElectrumClientType } from "~/types/index";
// TODO: change it
const electrumChipnet = new ElectrumClient(
  "mainnet-js-node",
  "1.5",
  "chipnet.imaginary.cash",
  50004,
  "wss"
);
await electrumChipnet.connect();

type network = "mainnet" | "chipnet";
const electrumClient = (network: network) => {
  if (network === "mainnet") {
    // TODO: change to mainnet
    return electrumChipnet as ElectrumClientType;
  } else {
    return electrumChipnet as ElectrumClientType;
  }
};

export type balance = { confirmed: number; unconfirmed: number };
export const getBalance = (address: string, network: network = "chipnet") =>
  electrumClient(network).request<balance>(
    "blockchain.address.get_balance",
    address
  );

export type history = {
  height: number;
  tx_hash: string;
}[];
export const getHistory = (address: string, network: network = "chipnet") =>
  electrumClient(network).request<history>(
    "blockchain.address.get_history",
    address
  );
