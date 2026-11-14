import { describe, expect, test } from "bun:test";
import {
	binToHex,
	hexToBin,
	lockingBytecodeToCashAddress,
	utf8ToBin,
} from "@bitauth/libauth";

// Nuxt auto-imports these at runtime; use real Vue primitives for pure helpers.
Object.assign(globalThis, {
	ref,
	watch,
	useRuntimeConfig: () => ({
		public: { ipfsGateway: "https://gateway.example" },
	}),
});

import { ref, watch } from "vue";
import type { GetAuthChainsQuery } from "../src/graphql/graphql";

const { decodeAuthChain } = await import("../src/module/bcmr");

const {
	addPrefixToAddress,
	addressToLockingBytecodeHex,
	calculateDecimal,
	getAddressType,
	isValidAddress,
	normalizeMetadataUrl,
	opreturnToAuthChainElement,
	parseBinary,
	satToBch,
} = await import("../src/module/bitcoin");

const addresses = [
	{
		cash: "bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a",
		legacy: "1BpEi6DfDAUFd7GtittLSdBeYJvcoaVggu",
		bytecode: "76a91476a04053bda0a88bda5177b86a15c3b29f55987388ac",
		type: "P2PKH",
	},
	{
		cash: "bitcoincash:ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq",
		legacy: "3CWFddi6m4ndiGyKqzYvsFYagqDLPVMTzC",
		bytecode: "a91476a04053bda0a88bda5177b86a15c3b29f55987387",
		type: "P2SH",
	},
];

describe("address conversion with Libauth 3", () => {
	test("retains P2SH32 scripts for ordinary and token-aware addresses", () => {
		const bytecode = `aa20${"0123456789abcdef".repeat(4)}87`;
		for (const address of [
			"bitcoincash:pvqjx3t83x4ummcpydzk0zdtehhszg69v7y6hn00qy352euf40x77nngu7utv",
			"bitcoincash:rvqjx3t83x4ummcpydzk0zdtehhszg69v7y6hn00qy352euf40x77pq5a8aj8",
		]) {
			expect(isValidAddress(address)).toBe(true);
			expect(getAddressType(address)).toBe("P2SH");
			expect(addressToLockingBytecodeHex(address)).toBe(bytecode);
		}
	});

	for (const { cash, legacy, bytecode, type } of addresses) {
		test(`${type} CashAddr and legacy addresses identify the same script`, () => {
			const withoutPrefix = cash.slice("bitcoincash:".length);
			expect(isValidAddress(cash)).toBe(true);
			expect(isValidAddress(withoutPrefix)).toBe(true);
			expect(isValidAddress(legacy)).toBe(true);
			expect(addPrefixToAddress(withoutPrefix)).toBe(cash);
			expect(getAddressType(cash)).toBe(type);
			expect(addressToLockingBytecodeHex(cash)).toBe(bytecode);
			expect(addressToLockingBytecodeHex(withoutPrefix)).toBe(bytecode);
			expect(addressToLockingBytecodeHex(legacy)).toBe(bytecode);

			const tokenAddress = lockingBytecodeToCashAddress({
				bytecode: hexToBin(bytecode),
				tokenSupport: true,
			});
			expect(typeof tokenAddress).toBe("object");
			if (typeof tokenAddress !== "string") {
				expect(isValidAddress(tokenAddress.address)).toBe(true);
				expect(getAddressType(tokenAddress.address)).toBe(type);
				expect(addressToLockingBytecodeHex(tokenAddress.address)).toBe(
					bytecode,
				);
			}
		});
	}

	test.each([
		"",
		"not-an-address",
		"bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6x",
	])("rejects invalid addresses: %s", (address) =>
		expect(isValidAddress(address)).toBe(false),
	);
});

describe("decimal conversion with BigNumber 11", () => {
	test("retains satoshi precision beyond JavaScript's safe integer range", () => {
		expect(satToBch("9007199254740993", 8)).toBe("90071992.54740993");
		expect(satToBch("1", 8)).toBe("1e-8");
		expect(satToBch("123456789")).toBe("1.234568");
	});

	test("scales large token decimal counts without numeric overflow", () => {
		expect(calculateDecimal("1", 309).toString()).toBe("1e-309");
		expect(calculateDecimal("not-a-number", 8).toString()).toBe("0");
	});
});

describe("BCMR publication decoding", () => {
	const contentHash = "0123456789abcdef".repeat(4);
	const domain = binToHex(utf8ToBin("example.com"));

	test("decodes a direct-push HTTPS publication without reversing its hash", () => {
		expect(
			opreturnToAuthChainElement(`6a0442434d5220${contentHash}0b${domain}`),
		).toEqual({
			contentHash,
			url: "https://example.com/.well-known/bitcoin-cash-metadata-registry.json",
		});
	});

	test("decodes OP_PUSHDATA1 and OP_PUSHDATA2 pushes", () => {
		expect(
			opreturnToAuthChainElement(
				`6a4c0442434d524d2000${contentHash}4c0b${domain}`,
			),
		).toEqual({
			contentHash,
			url: "https://example.com/.well-known/bitcoin-cash-metadata-registry.json",
		});
	});

	test("preserves CID publication outputs", () => {
		const cid = "QmYwAPJzv5CZsnAzt8auVTLQzUKfyzQGzuJDn8GmRbKJfQ";
		const encodedCid = binToHex(utf8ToBin(cid));
		expect(opreturnToAuthChainElement(`6a0442434d522e${encodedCid}`)).toEqual({
			contentHash: encodedCid,
			url: `https://dweb.link/ipfs/${cid}`,
		});
	});

	test("normalizes explicit HTTP and IPFS URLs", () => {
		expect(normalizeMetadataUrl("https://example.com/registry.json")).toBe(
			"https://example.com/registry.json",
		);
		expect(normalizeMetadataUrl("http://example.com/registry.json")).toBe(
			"http://example.com/registry.json",
		);
		expect(normalizeMetadataUrl("ipfs://bafy/registry.json")).toBe(
			"https://gateway.example/ipfs/bafy/registry.json",
		);
	});

	test.each([
		"",
		"zz",
		"6",
		"6a",
		"6a0442434d52",
		"6a0442434d5220",
		"6a4c",
		"6a4d20",
		"6a0442434d5220abcd",
		`6a0442434d5220${contentHash}0b6578`,
		"6a0442434d5200",
		`6a0442434d5220${contentHash}00`,
		`760442434d5220${contentHash}0b${domain}`,
		"6a0442434d5251",
		`6a044e4f504520${contentHash}0b${domain}`,
	])("rejects incomplete or malformed publication %s", (hex) => {
		expect(opreturnToAuthChainElement(hex)).toBe("Invalid BCMR OP_RETURN");
	});

	test("does not silently accept partial or non-push scripts", () => {
		expect(parseBinary(hexToBin("6a030102"))).toEqual([]);
		expect(parseBinary(hexToBin("6a4c02aa"))).toEqual([]);
		expect(parseBinary(hexToBin("6a4d0200aa"))).toEqual([]);
		expect(parseBinary(hexToBin("6a51"))).toEqual([]);
		expect(parseBinary(hexToBin("6a000161"))).toEqual([
			new Uint8Array(),
			utf8ToBin("a"),
		]);
	});
});

describe("BCMR genesis supply", () => {
	function authchain(amount: string | null) {
		const tokenOutput = {
			token_category: "\\xaaaa" as const,
			locking_bytecode: "\\x0011" as const,
			fungible_token_amount: amount,
			nonfungible_token_capability: "none" as const,
			nonfungible_token_commitment: "\\x" as const,
		};
		return {
			transaction: [
				{
					hash: "\\xaaaa" as const,
					authchains: [
						{
							authchain_length: 1,
							authhead_transaction_hash: "\\xcccc" as const,
							unspent_authhead: true,
							authhead: null,
							migrations: [
								{
									migration_index: "0",
									transaction: [
										{
											hash: "\\xcccc" as const,
											block_inclusions: [],
											inputs: [
												{
													outpoint_index: "0",
													outpoint_transaction_hash: "\\xaaaa" as const,
												},
											],
											outputs: [
												tokenOutput,
												{
													...tokenOutput,
													fungible_token_amount: amount ? "7" : null,
												},
												{
													...tokenOutput,
													token_category: "\\xbbbb" as const,
													fungible_token_amount: "9223372036854775807",
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

	test("sums only the requested category without rounding large amounts", () => {
		const genesis = decodeAuthChain(authchain("9007199254740993"), "aaaa");
		expect(genesis?.genesesTx.genesisSupply).toBe("9007199254741000");
		expect(genesis?.genesesTx.lockingBytecode).toBe("0011");
		expect(
			calculateDecimal(genesis?.genesesTx.genesisSupply || "0", 8).toFixed(),
		).toBe("90071992.54741");
	});

	test("does not treat a nonzero first outpoint as token genesis", () => {
		const data = authchain("9007199254740993");
		const input =
			data.transaction[0]?.authchains[0]?.migrations[0]?.transaction[0]
				?.inputs[0];
		if (input) input.outpoint_index = "1";
		expect(decodeAuthChain(data, "aaaa")).toBeUndefined();
	});

	test("retains a zero fungible supply for NFT-only categories", () => {
		expect(
			decodeAuthChain(authchain(null), "aaaa")?.genesesTx.genesisSupply,
		).toBe("0");
		expect(decodeAuthChain(authchain(null), "absent")).toBeUndefined();
	});
});

test("a later index-zero input authorizes genesis with either safe numeric or string indices", () => {
	const data: GetAuthChainsQuery = {
		transaction: [
			{
				hash: "\\xaaaa",
				authchains: [
					{
						authchain_length: 1,
						authhead_transaction_hash: "\\xcccc",
						unspent_authhead: true,
						authhead: null,
						migrations: [
							{
								migration_index: "0",
								transaction: [
									{
										hash: "\\xcccc",
										block_inclusions: [],
										inputs: [
											{
												outpoint_transaction_hash: "\\xffff",
												outpoint_index: "0",
											},
											{
												outpoint_transaction_hash: "\\xaaaa",
												outpoint_index: "0",
											},
										],
										outputs: [
											{
												token_category: "\\xaaaa",
												locking_bytecode: "\\x51",
												fungible_token_amount: null,
												nonfungible_token_capability: "none",
												nonfungible_token_commitment: "\\x",
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
	};
	const input =
		data.transaction[0]!.authchains[0]!.migrations[0]!.transaction![0]!
			.inputs[1]!;
	for (const index of ["0", 0]) {
		Object.defineProperty(input, "outpoint_index", {
			value: index,
			configurable: true,
		});
		expect(decodeAuthChain(data, "aaaa")?.genesesTx.nftCapability).toBe("none");
	}
});
