import { describe, expect, test } from "bun:test";
import {
	compactTokenBadgeCommitment,
	formatTokenBadgeAmount,
} from "../src/module/tokenBadgeDisplay";

describe("transaction token badge amounts", () => {
	test.each([
		["0", "0"],
		["999", "999"],
		["1000", "1k"],
		["2000", "2k"],
		["1234", "≈1.23k"],
		["1235", "≈1.24k"],
		["999499", "≈999k"],
		["999500", "≈1m"],
		["1000000", "1m"],
		["1000000000", "1b"],
		["1000000000000", "1t"],
		["999500000000000", "≈1e+15"],
		["1000000000000000", "1e+15"],
	])("formats %s as %s without changing the exact value", (raw, display) => {
		expect(formatTokenBadgeAmount(raw)).toEqual({ exact: raw, display });
	});

	test.each([
		["200000", 2, "2000", "2k"],
		["2000", 2, "20", "20"],
		["999999", 3, "999.999", "999.999"],
		["1000001", 3, "1000.001", "≈1k"],
		["1", 18, "0.000000000000000001", "0.000000000000000001"],
		["00000123", 2, "1.23", "1.23"],
	])(
		"applies metadata decimals to %s before compaction",
		(raw, decimals, exact, display) => {
			expect(formatTokenBadgeAmount(raw, decimals)).toEqual({ exact, display });
		},
	);

	test("retains every base unit beyond Number.MAX_SAFE_INTEGER", () => {
		expect(formatTokenBadgeAmount("9007199254740993", 2)).toEqual({
			exact: "90071992547409.93",
			display: "≈90.1t",
		});
		expect(formatTokenBadgeAmount("9223372036854775807")).toEqual({
			exact: "9223372036854775807",
			display: "≈9.22e+18",
		});
	});

	test("never overflows or uses exponential notation for the exact value", () => {
		const huge = `12345${"0".repeat(400)}`;
		expect(formatTokenBadgeAmount(huge)).toEqual({
			exact: huge,
			display: "≈1.23e+404",
		});
		expect(formatTokenBadgeAmount(`1${"0".repeat(400)}`)?.display).toBe(
			"1e+400",
		);
	});

	test.each(["", "NaN", "Infinity", "-1", "1.5", "1e3"])(
		"does not present an invalid on-chain amount as zero: %s",
		(raw) => expect(formatTokenBadgeAmount(raw)).toBeUndefined(),
	);

	test.each([-1, 1.5, 19, Number.NaN, Number.POSITIVE_INFINITY])(
		"does not guess the unit for invalid metadata decimals: %s",
		(decimals) =>
			expect(formatTokenBadgeAmount("1234", decimals)).toBeUndefined(),
	);
});

describe("transaction NFT commitment badges", () => {
	test("uses the issue's prefix and suffix without interpreting hex as a number", () => {
		expect(
			compactTokenBadgeCommitment(
				"400d0300a91493439efbd0d0906be50e59f4a09d26e25192461b87",
			),
		).toBe("400d030......92461b87");
		const commitment = `0000000${"aB".repeat(20)}00000001`;
		expect(compactTokenBadgeCommitment(commitment)).toBe(
			"0000000......00000001",
		);
	});

	test.each(["", "00", "00000001", "0123456789abcdef01234"])(
		"keeps empty and short commitments intact: %s",
		(commitment) =>
			expect(compactTokenBadgeCommitment(commitment)).toBe(commitment),
	);

	test("only abbreviates when the result is shorter", () => {
		expect(compactTokenBadgeCommitment("0123456789abcdef012345")).toBe(
			"0123456......ef012345",
		);
	});
});
