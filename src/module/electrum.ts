import { ElectrumClient } from "electrum-cash";

export const electrum = new ElectrumClient(
  "mainnet-js-node",
  "1.5",
  "chipnet.imaginary.cash",
  50004,
  "wss"
);

export type network = "mainnet" | "chipnet";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const electrumClient = (network: network) => {
  return electrum;
};

export const getBalance = (address: string, network: network = "chipnet") =>
  electrumClient(network).request("blockchain.address.get_balance", address);

export const getHistory = (address: string, network: network = "chipnet") =>
  electrumClient(network).request("blockchain.address.get_history", address);
