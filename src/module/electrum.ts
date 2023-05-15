import { ElectrumClient } from "electrum-cash";

export const electrum = new ElectrumClient(
  "mainnet-js-node",
  "1.5",
  "bch.imaginary.cash"
);

await electrum.connect().catch(console.log);
export type network = "mainnet" | "chipnet";
