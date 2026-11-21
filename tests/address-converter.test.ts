import { describe, expect, test } from "bun:test";
import {
	base58AddressToLockingBytecode,
	binToHex,
	cashAddressToLockingBytecode,
	decodeCashAddress,
	encodeCashAddress,
	encodeCashAddressNonStandard,
} from "@bitauth/libauth";
import { convertAddress } from "../src/module/address-converter";

// Fixed vectors pin exact encodings rather than calculating expected outputs
// with the same encoder under test. The first two use the CashAddr spec payload.
const vectors = [
	{
		type: "P2PKH",
		bytecode: "76a91476a04053bda0a88bda5177b86a15c3b29f55987388ac",
		mainnet: {
			regular: "bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a",
			token: "bitcoincash:zpm2qsznhks23z7629mms6s4cwef74vcwvrqekrq9w",
			legacy: "1BpEi6DfDAUFd7GtittLSdBeYJvcoaVggu",
		},
		chipnet: {
			regular: "bchtest:qpm2qsznhks23z7629mms6s4cwef74vcwvqcw003ap",
			token: "bchtest:zpm2qsznhks23z7629mms6s4cwef74vcwv8ja3phzj",
			legacy: "mrLC19Je2BuWQDkWSTriGYPyQJXKkkBmCx",
		},
	},
	{
		type: "P2SH20",
		bytecode: "a91476a04053bda0a88bda5177b86a15c3b29f55987387",
		mainnet: {
			regular: "bitcoincash:ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq",
			token: "bitcoincash:rpm2qsznhks23z7629mms6s4cwef74vcwv59yeyr7n",
			legacy: "3CWFddi6m4ndiGyKqzYvsFYagqDLPVMTzC",
		},
		chipnet: {
			regular: "bchtest:ppm2qsznhks23z7629mms6s4cwef74vcwvhanqgjxu",
			token: "bchtest:rpm2qsznhks23z7629mms6s4cwef74vcwvshq7x5e0",
			legacy: "2N44ThNe8NXHyv4bsX8AoVCXquBRW94Ls7W",
		},
	},
	{
		type: "P2SH32",
		bytecode: `aa20${"0123456789abcdef".repeat(4)}87`,
		mainnet: {
			regular:
				"bitcoincash:pvqjx3t83x4ummcpydzk0zdtehhszg69v7y6hn00qy352euf40x77nngu7utv",
			token:
				"bitcoincash:rvqjx3t83x4ummcpydzk0zdtehhszg69v7y6hn00qy352euf40x77pq5a8aj8",
			legacy: undefined,
		},
		chipnet: {
			regular:
				"bchtest:pvqjx3t83x4ummcpydzk0zdtehhszg69v7y6hn00qy352euf40x77s5ezx077",
			token:
				"bchtest:rvqjx3t83x4ummcpydzk0zdtehhszg69v7y6hn00qy352euf40x77z89rlw84",
			legacy: undefined,
		},
	},
] as const;

describe("address converter", () => {
	for (const vector of vectors) {
		for (const inputNetwork of ["mainnet", "chipnet"] as const) {
			const source = vector[inputNetwork];
			const formats = [
				{ label: "Regular CashAddr", address: source.regular },
				{ label: "Token-aware CashAddr", address: source.token },
			].flatMap(({ label, address }) => [
				{ label, variant: "prefixed", address },
				{
					label,
					variant: "prefixless",
					address: address.slice(address.indexOf(":") + 1),
				},
				{ label, variant: "uppercase", address: address.toUpperCase() },
				{
					label,
					variant: "uppercase prefixless",
					address: address.slice(address.indexOf(":") + 1).toUpperCase(),
				},
				{ label, variant: "whitespace", address: ` \t${address}\n` },
			]);
			const inputs = source.legacy
				? [
						...formats,
						{ label: "Legacy", variant: "base58", address: source.legacy },
					]
				: formats;

			for (const { label, variant, address } of inputs) {
				for (const outputNetwork of ["mainnet", "chipnet"] as const) {
					test(`${vector.type} ${inputNetwork} ${label} ${variant} → ${outputNetwork}`, () => {
						const result = convertAddress(address, outputNetwork);
						const expected = vector[outputNetwork];
						expect(result.status).toBe("ready");
						if (result.status !== "ready") return;
						expect(result).toEqual({
							status: "ready",
							inputFormat: label,
							inputNetwork:
								inputNetwork === "mainnet" ? "Mainnet" : "Test networks",
							addressType: vector.type,
							regularAddress: expected.regular,
							tokenAddress: expected.token,
							legacyAddress: expected.legacy,
						});

						// Decode the results to check the receiver script,
						// network, and token-support distinction, not just their text.
						for (const [encoded, tokenSupport] of [
							[result.regularAddress, false],
							[result.tokenAddress, true],
						] as const) {
							const decoded = cashAddressToLockingBytecode(encoded);
							expect(typeof decoded).toBe("object");
							if (typeof decoded === "string") continue;
							expect(binToHex(decoded.bytecode)).toBe(vector.bytecode);
							expect(decoded.prefix).toBe(
								outputNetwork === "mainnet" ? "bitcoincash" : "bchtest",
							);
							expect(decoded.tokenSupport).toBe(tokenSupport);
						}
						if (result.legacyAddress) {
							const decoded = base58AddressToLockingBytecode(
								result.legacyAddress,
							);
							expect(typeof decoded).toBe("object");
							if (typeof decoded === "string") return;
							expect(binToHex(decoded.bytecode)).toBe(vector.bytecode);
							expect(decoded.version).toBe(
								vector.type === "P2PKH"
									? outputNetwork === "mainnet"
										? 0
										: 111
									: outputNetwork === "mainnet"
										? 5
										: 196,
							);
						}
					});
				}
			}
		}
	}

	test.each(["", " ", "\t\n"])(
		"empty input %j has no error or outputs",
		(input) => {
			expect(convertAddress(input, "mainnet")).toEqual({ status: "empty" });
		},
	);

	test.each([
		"not-an-address",
		"bitcoincash:",
		":qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a",
		"bitcoincash::qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a",
		"bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6x",
		"qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6x",
		"bchtest:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a",
		"bitcoincash:Qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a",
		"qPm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a",
		"bitcoincash:qpm2qsznhks23z7629 mms6s4cwef74vcwvy22gdx6a",
		"bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a?amount=1",
		"1BpEi6DfDAUFd7GtittLSdBeYJvcoaVggx",
	])(
		"invalid input %s returns no usable address and does not throw",
		(input) => {
			expect(convertAddress(input, "mainnet")).toEqual({ status: "invalid" });
			expect(convertAddress(input, "chipnet")).toEqual({ status: "invalid" });
		},
	);

	test.each(["bchreg", "simpleledger", "ecash", "unsupported"])(
		"rejects a valid checksum with unsupported prefix %s",
		(prefix) => {
			const { address } = encodeCashAddressNonStandard({
				prefix,
				typeBits: 0,
				payload: new Uint8Array(20),
			});
			expect(typeof decodeCashAddress(address)).toBe("object");
			expect(convertAddress(address, "mainnet")).toEqual({ status: "invalid" });
			expect(
				convertAddress(address.slice(address.indexOf(":") + 1), "chipnet"),
			).toEqual({
				status: "invalid",
			});
		},
	);

	test("rejects nonstandard P2PKH payload lengths even with a valid checksum", () => {
		const { address } = encodeCashAddress({
			type: "p2pkh",
			payload: new Uint8Array(32),
		});
		expect(convertAddress(address, "mainnet")).toEqual({ status: "invalid" });
	});
});
