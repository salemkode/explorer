import { binToHex, sha256, utf8ToBin } from "@bitauth/libauth";
import type { GetAuthChainsQuery } from "../../src/graphql/graphql";

export const category = "aa".repeat(32);
export function registryDocument(name: string, tokenCategory = category) {
	return JSON.stringify({
		version: { major: 1, minor: 0, patch: 0 },
		latestRevision: "2023-01-01T00:00:00.000Z",
		registryIdentity: { name: "Fixture registry" },
		identities: {
			[tokenCategory]: {
				"2023-01-01T00:00:00.000Z": {
					name,
					token: { category: tokenCategory, symbol: name, decimals: 2 },
				},
			},
		},
	});
}
export const documents = {
	"https://fixtures.example/old.json": registryDocument("Original"),
	"https://fixtures.example/new.json": registryDocument("Updated"),
	"https://fixtures.example/other.json": registryDocument("Other chain"),
};
export function publicationScript(url: string, body: string) {
	const location = utf8ToBin(url);
	return `\\x6a0442434d5220${binToHex(sha256.hash(utf8ToBin(body)))}${location.length.toString(16).padStart(2, "0")}${binToHex(location)}` as const;
}
export function migration(
	id: string,
	index: string,
	script: `\\x${string}` = "\\x51",
	genesis = false,
) {
	return {
		migration_index: index,
		transaction: [
			{
				hash: `\\x${id.repeat(64)}` as const,
				block_inclusions: [{ block: { timestamp: "1700000000" } }],
				inputs: [
					{
						outpoint_index: "0",
						outpoint_transaction_hash:
							`\\x${genesis ? category : "ff".repeat(32)}` as const,
					},
				],
				outputs: [
					{
						token_category: `\\x${category}` as const,
						locking_bytecode: "\\x51" as const,
						fungible_token_amount: "1000",
						nonfungible_token_capability: null,
						nonfungible_token_commitment: null,
					},
					{
						token_category: null,
						locking_bytecode: script,
						fungible_token_amount: null,
						nonfungible_token_capability: null,
						nonfungible_token_commitment: null,
					},
				],
			},
		],
	};
}
export const authChainFixture = {
	transaction: [
		{
			hash: `\\x${category}`,
			authchains: [
				{
					authchain_length: 4,
					authhead_transaction_hash: `\\x${"4".repeat(64)}`,
					unspent_authhead: true,
					authhead: {
						hash: `\\x${"4".repeat(64)}`,
						identity_output: [{ fungible_token_amount: "25" }],
					},
					// Deliberately shuffled, with identical block times.
					migrations: [
						migration(
							"1",
							"0",
							publicationScript(
								"https://fixtures.example/old.json",
								documents["https://fixtures.example/old.json"],
							),
							true,
						),
						migration("4", "3"),
						migration(
							"3",
							"2",
							publicationScript(
								"https://fixtures.example/new.json",
								documents["https://fixtures.example/new.json"],
							),
						),
						migration("2", "1"),
					],
				},
				{
					authchain_length: 2,
					authhead_transaction_hash: `\\x${"6".repeat(64)}`,
					unspent_authhead: false,
					authhead: {
						hash: `\\x${"6".repeat(64)}`,
						identity_output: [{ fungible_token_amount: "80" }],
					},
					migrations: [
						migration(
							"6",
							"1",
							publicationScript(
								"https://fixtures.example/other.json",
								documents["https://fixtures.example/other.json"],
							),
						),
						migration("5", "0", "\\x51", true),
					],
				},
			],
		},
	],
} satisfies GetAuthChainsQuery;
