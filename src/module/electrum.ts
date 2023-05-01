import { ElectrumClient } from "electrum-cash";

export const electrum = new ElectrumClient(
  "mainnet-js-node",
  "1.5",
  "chipnet.imaginary.cash",
  50004,
  "wss"
);

await electrum.connect().catch(console.log);
export type network = "mainnet" | "chipnet";
