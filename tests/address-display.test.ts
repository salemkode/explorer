import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import {
	binToHex,
	cashAddressToLockingBytecode,
	encodeBase58Address,
	hexToBin,
} from "@bitauth/libauth";
import { createPinia, setActivePinia } from "pinia";
import { computed, effectScope, nextTick, ref, watch } from "vue";

Object.assign(globalThis, {
	computed,
	ref,
	watch,
	gql: (source: string) => source,
	useSubscription: () => ({ result: ref() }),
});
const {
	addressDisplayMode,
	formatLockingBytecodeAddress,
	formatUtxoAddress,
	normalizeDisplayAddress,
	useAddressDisplayPreference,
} = await import("../src/hooks/addressDisplay");
const { useStateStore } = await import("../src/store/state");

const scripts = [
	{ bytecode: `76a914${"12".repeat(20)}88ac`, label: "P2PKH" },
	{ bytecode: `a914${"12".repeat(20)}87`, label: "P2SH" },
	{ bytecode: `aa20${"12".repeat(32)}87`, label: "P2SH" },
] as const;
const category = `\\x${"34".repeat(32)}` as const;
const holdings = [
	{ name: "BCH only", token_category: null, fungible_token_amount: "0" },
	{ name: "missing category", fungible_token_amount: "500" },
	{ name: "FT", token_category: category, fungible_token_amount: "100" },
	{
		name: "NFT without FTs",
		token_category: category,
		fungible_token_amount: "0",
		nonfungible_token_capability: "none",
		nonfungible_token_commitment: "\\x",
	},
];

beforeEach(() => {
	setActivePinia(createPinia());
	addressDisplayMode.value = "auto";
});

for (const mode of ["auto", "token", "regular"] as const) {
	for (const network of ["mainnet", "chipnet"] as const) {
		for (const { bytecode, label } of scripts) {
			for (const holding of holdings) {
				test(`${mode} ${network} ${bytecode.slice(0, 6)} ${holding.name}`, () => {
					addressDisplayMode.value = mode;
					useStateStore().network = network;
					const output = { ...holding, locking_bytecode: `\\x${bytecode}` };
					const result = formatUtxoAddress(output);
					expect(result).toBeDefined();
					if (!result) throw new Error("Expected a supported address");
					const decoded = cashAddressToLockingBytecode(result.fullAddress);
					if (typeof decoded === "string") throw new Error(decoded);
					expect(binToHex(decoded.bytecode)).toBe(bytecode);
					expect(decoded.prefix).toBe(
						network === "mainnet" ? "bitcoincash" : "bchtest",
					);
					expect(decoded.tokenSupport).toBe(
						mode === "token" ||
							(mode === "auto" && Boolean(output.token_category)),
					);
					// Script labels must never imply token holdings, even under override.
					expect(result.addressType).toBe(label);
					expect(
						formatUtxoAddress({ ...output, locking_bytecode: bytecode }),
					).toEqual(result);

					// Copy text and the link destination lead to the same full QR payload.
					const destination = result.url.slice("/address/".length);
					expect(destination).toBe(result.address);
					expect(
						normalizeDisplayAddress(destination, { removePrefix: false }),
					).toBe(result.fullAddress);
					expect(normalizeDisplayAddress(destination)).toBe(result.address);
				});
			}
		}
	}
}

test("the same address can have independent BCH-only and token UTXOs", () => {
	const locking_bytecode = scripts[0].bytecode;
	const token = formatUtxoAddress({
		locking_bytecode,
		token_category: category,
	});
	const regular = formatUtxoAddress({ locking_bytecode });
	expect(regular?.address).not.toBe(token?.address);
	expect(formatUtxoAddress({ locking_bytecode })).toEqual(regular);
	expect(formatLockingBytecodeAddress(locking_bytecode)).toBe(regular?.address);
	const reactiveAddress = computed(() =>
		formatUtxoAddress({ locking_bytecode }),
	);
	expect(reactiveAddress.value).toEqual(regular);
	addressDisplayMode.value = "token";
	expect(reactiveAddress.value).toEqual(token);
	addressDisplayMode.value = "auto";
	expect(reactiveAddress.value).toEqual(regular);
});

test("address pages retain the incoming network and encoding independently of selected network", () => {
	useStateStore().network = "chipnet";
	const source = formatUtxoAddress({
		locking_bytecode: scripts[2].bytecode,
		token_category: category,
	});
	if (!source) throw new Error("Expected P2SH32 address");
	useStateStore().network = "mainnet";
	expect(normalizeDisplayAddress(source.address, { removePrefix: false })).toBe(
		source.fullAddress,
	);
	addressDisplayMode.value = "regular";
	const regular = cashAddressToLockingBytecode(
		normalizeDisplayAddress(source.address, { removePrefix: false }),
	);
	if (typeof regular === "string") throw new Error(regular);
	expect(regular.prefix).toBe("bchtest");
	expect(regular.tokenSupport).toBe(false);
	expect(binToHex(regular.bytecode)).toBe(scripts[2].bytecode);
});

for (const type of [
	"p2pkh",
	"p2pkhTestnet",
	"p2sh20",
	"p2sh20Testnet",
] as const) {
	test(`legacy ${type} becomes regular CashAddr on its original network`, () => {
		const legacy = encodeBase58Address(type, hexToBin("12".repeat(20)));
		const fullAddress = normalizeDisplayAddress(legacy, {
			removePrefix: false,
		});
		const decoded = cashAddressToLockingBytecode(fullAddress);
		if (typeof decoded === "string") throw new Error(decoded);
		expect(decoded.prefix).toBe(
			type.endsWith("Testnet") ? "bchtest" : "bitcoincash",
		);
		expect(decoded.tokenSupport).toBe(false);
		addressDisplayMode.value = "token";
		const token = cashAddressToLockingBytecode(
			normalizeDisplayAddress(legacy, { removePrefix: false }),
		);
		if (typeof token === "string") throw new Error(token);
		expect(binToHex(token.bytecode)).toBe(binToHex(decoded.bytecode));
		expect(token.prefix).toBe(decoded.prefix);
		expect(token.tokenSupport).toBe(true);
	});
}

test("unsupported locking bytecode never becomes an address or link", () => {
	for (const locking_bytecode of ["", "6a", "\\x6a", "51"]) {
		expect(formatUtxoAddress({ locking_bytecode })).toBeUndefined();
	}
});

describe("browser preference migration", () => {
	const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
	const previousStorage = Object.getOwnPropertyDescriptor(
		globalThis,
		"localStorage",
	);
	const values = new Map<string, string>();
	const storage = {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => values.set(key, value),
	};

	afterAll(() => {
		for (const [key, descriptor] of [
			["window", previousWindow],
			["localStorage", previousStorage],
		] as const) {
			if (descriptor) Object.defineProperty(globalThis, key, descriptor);
			else Reflect.deleteProperty(globalThis, key);
		}
	});

	for (const saved of [
		undefined,
		'"auto"',
		'"token"',
		'"regular"',
		"token",
		"regular",
		'"invalid"',
		"broken-json{",
		"null",
		"false",
		"42",
		"{}",
		"[]",
	]) {
		test(`validates and persists saved value ${saved}`, async () => {
			values.clear();
			Object.assign(globalThis, {
				window: { localStorage: storage },
				localStorage: storage,
			});
			if (saved !== undefined) values.set("addressDisplayMode", saved);
			const scope = effectScope();
			try {
				const preference = scope.run(useAddressDisplayPreference);
				if (!preference) throw new Error("Expected a preference ref");
				const expected =
					saved === '"token"' || saved === "token"
						? "token"
						: saved === '"regular"' || saved === "regular"
							? "regular"
							: "auto";
				expect(preference.value).toBe(expected);
				await nextTick();
				if (saved !== undefined && expected === "auto" && saved !== '"auto"') {
					expect(values.get("addressDisplayMode")).toBe('"auto"');
				}
				preference.value = expected === "token" ? "regular" : "token";
				await nextTick();
				expect(values.get("addressDisplayMode")).toBe(
					JSON.stringify(preference.value),
				);
				const reloaded = scope.run(useAddressDisplayPreference);
				expect(reloaded?.value).toBe(preference.value);
			} finally {
				scope.stop();
			}
		});
	}
});
