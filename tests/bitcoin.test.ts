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
