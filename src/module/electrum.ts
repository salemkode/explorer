import { ElectrumClient } from "@electrum-cash/network";
import { array, number, object, string } from "valibot";

export const addressHistorySchema = array(
	object({ height: number(), tx_hash: string() }),
);
export const addressBalanceSchema = object({
	confirmed: number(),
	unconfirmed: number(),
});

export const electrum = new ElectrumClient(
	"mainnet-js-node",
	"1.5",
	"bch.imaginary.cash",
	{ port: 50004, encrypted: true },
);

await electrum.connect().catch(console.log);
