// electrum-cash v3's package exports defeat TypeScript resolution (the
// "browser" build declared in its exports map is not published), so the
// module's types are declared here. Only the API surface the app uses is
// covered.
declare module "electrum-cash" {
	/** Electrum server balance response for an address */
	export type balance = { confirmed: number; unconfirmed: number };

	/** Electrum server address history response */
	export type history = {
		height: number;
		tx_hash: string;
	}[];

	export type TransportScheme = "tcp" | "tcp_tls" | "ws" | "wss";

	export declare class ElectrumClient {
		constructor(
			application: string,
			version: string,
			host: string,
			port?: number,
			scheme?: TransportScheme,
			timeout?: number,
			pingInterval?: number,
			reconnectInterval?: number,
		);

		connect(): Promise<void>;

		disconnect(
			force?: boolean,
			retainSubscriptions?: boolean,
		): Promise<boolean>;

		request(
			method: "blockchain.address.get_balance",
			address: string,
		): Promise<Error | balance>;

		request(
			method: "blockchain.address.get_history",
			address: string,
		): Promise<Error | history>;

		request<T>(method: string, ...parameters: string[]): Promise<Error | T>;

		subscribe(method: string, ...parameters: string[]): Promise<void>;

		unsubscribe(method: string, ...parameters: string[]): Promise<void>;
	}
}
