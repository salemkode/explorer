import type { SubscribeCallback } from "electrum-cash";

declare module "electrum-cash" {
	type balance = { confirmed: number; unconfirmed: number };
	type history = {
		height: number;
		tx_hash: string;
	}[];

	export class ElectrumClient extends this.ElectrumClient {
		constructor(
			application: string,
			version: string,
			host: string,
			port?: number,
			scheme?: TransportScheme,
			timeout?: number,
			pingInterval?: number,
		);

		request(
			method: "blockchain.address.get_balance",
			address: string,
		): Promise<Error | balance>;

		request(
			method: "blockchain.address.get_history",
			address: string,
		): Promise<Error | history>;

		request<T>(method: string, ...parameters: string[]): Promise<Error | T>;

		subscribe(
			callback: SubscribeCallback,
			method: string,
			...parameters: string[]
		): Promise<true>;
	}
}
