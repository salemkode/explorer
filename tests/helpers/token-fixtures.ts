import type { GetAuthChainsQuery, GetTxQuery } from "../../src/graphql/graphql";

export const tokenA = "aa".repeat(32);
export const txB = "bb".repeat(32);
export const tokenC = "cc".repeat(32);
export const publication = "6a0442434d52086d65746164617461";

/** `isCategory`: output 0 was spent by the genesis of a category equal to `hash`. */
export function txResponse(hash: string, opreturn = "", isCategory = true) {
	return {
		transaction: [
			{
				hash: `\\x${hash}` as const,
				input_value_satoshis: "1000",
				output_value_satoshis: "900",
				is_coinbase: false,
				block_inclusions: [
					{
						block: {
							hash: `\\x${"dd".repeat(32)}` as const,
							timestamp: "1700000000",
							height: "800000",
						},
					},
				],
				inputs: [],
				category_genesis: [
					{
						spent_by: [
							{
								transaction: {
									outputs: isCategory ? [{ output_index: "0" }] : [],
								},
							},
						],
					},
				],
				outputs: opreturn
					? [
							{
								locking_bytecode: `\\x${opreturn}` as const,
								value_satoshis: "0",
								token_category: null,
								fungible_token_amount: null,
								nonfungible_token_commitment: null,
								nonfungible_token_capability: null,
							},
						]
					: [],
			},
		],
		node: [],
	} satisfies GetTxQuery;
}

export function chainResponse(category: string, opreturn = publication) {
	return {
		transaction: [
			{
				hash: `\\x${category}` as const,
				authchains: [
					{
						authchain_length: 1,
						authhead_transaction_hash: `\\x${category}` as const,
						unspent_authhead: true,
						authhead: {
							hash: `\\x${category}` as const,
							identity_output: [
								{
									output_index: "0",
									locking_bytecode: `\\x76a914${"33".repeat(20)}88ac` as const,
									fungible_token_amount: "40",
									nonfungible_token_capability: null,
								},
							],
						},
						migrations: [
							{
								migration_index: "0",
								transaction: [
									{
										hash: `\\x${"ee".repeat(32)}` as const,
										inputs: [
											{
												outpoint_transaction_hash: `\\x${category}` as const,
												outpoint_index: "0",
											},
										],
										block_inclusions: [{ block: { timestamp: "1700000000" } }],
										outputs: [
											{
												token_category: `\\x${category}` as const,
												fungible_token_amount: "100",
												locking_bytecode:
													"\\x76a914000000000000000000000000000000000000000088ac" as const,
												nonfungible_token_capability: null,
												nonfungible_token_commitment: null,
											},
											{
												token_category: null,
												fungible_token_amount: null,
												locking_bytecode: `\\x${opreturn}` as const,
												nonfungible_token_capability: null,
												nonfungible_token_commitment: null,
											},
										],
									},
								],
							},
						],
					},
				],
			},
		],
	} satisfies GetAuthChainsQuery;
}

export function registry(category: string, name: string) {
	return {
		version: { major: 2, minor: 0, patch: 0 },
		latestRevision: "2024-01-01T00:00:00.000Z",
		registryIdentity: { name: "Test registry" },
		identities: {
			[category]: {
				"2024-01-01T00:00:00.000Z": {
					name,
					token: { category, symbol: name, decimals: 0 },
				},
			},
		},
	};
}
