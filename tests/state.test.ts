import { beforeEach, describe, expect, test } from "bun:test";
import {
	binToHex,
	cashAddressToLockingBytecode,
	decodeCashAddress,
} from "@bitauth/libauth";
import { createPinia, setActivePinia } from "pinia";
import { computed, ref } from "vue";
import { gql } from "../src/graphql/gql";

Object.assign(globalThis, {
	ref,
	computed,
	gql,
	useSubscription: () => ({ result: ref() }),
});
const { useStateStore } = await import("../src/store/state");

beforeEach(() => setActivePinia(createPinia()));

describe("Libauth 3 store address conversion", () => {
	const bytecodes = [
		`76a914${"12".repeat(20)}88ac`,
		`a914${"12".repeat(20)}87`,
		`aa20${"12".repeat(32)}87`,
	];

	for (const bytecode of bytecodes) {
		for (const network of ["mainnet", "chipnet"] as const) {
			for (const tokenSupport of [false, true]) {
				test(`${bytecode.slice(0, 6)} ${network} tokens=${tokenSupport}`, () => {
					const store = useStateStore();
					store.network = network;
					const address = store.lockingBytecodeHexToCashAddress(
						bytecode,
						tokenSupport,
					);
					expect(address).toBeDefined();
					if (!address) throw new Error("Expected a valid address");
					const decoded = cashAddressToLockingBytecode(address);
					expect(typeof decoded).toBe("object");
					if (typeof decoded === "string") throw new Error(decoded);
					expect(binToHex(decoded.bytecode)).toBe(bytecode);
					expect(decoded.prefix).toBe(
						network === "mainnet" ? "bitcoincash" : "bchtest",
					);
					const cashAddress = decodeCashAddress(address);
					if (typeof cashAddress === "string") throw new Error(cashAddress);
					expect(cashAddress.type.endsWith("WithTokens")).toBe(tokenSupport);
				});
			}
		}
	}

	test("unsupported locking bytecode does not expose an error as an address", () => {
		expect(
			useStateStore().lockingBytecodeHexToCashAddress("6a"),
		).toBeUndefined();
	});
});
