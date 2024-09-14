import type { Scalars } from "~/graphql/graphql";
export type bigNum = number | string | BigNumber;
export type bytea = `\\x${string}`;

export type RegistryProvider = {
	name: string;
	url: string;
	enable: boolean;
	default: boolean;
};

export type Capability = "none" | "mutable" | "minting" | undefined;
export interface tableColumn {
	text: string | number;
	short?: boolean;
	copy?: boolean;
	url?: string;
	token?: {
		category: string;
		capability?: capability;
		commitment?: string;
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
	nonfungible_token_capability?: Capability | null;
	nonfungible_token_commitment?: bytea | null;
	locking_bytecode: string;
	value_satoshis: string;
}

export type tokenCapability = Scalars["enum_nonfungible_token_capability"];

export * from "./bcmr-v2.schema";
