import { describe, expect, test } from "bun:test";
import {
	formatSatoshisAsBch,
	formatTokenAmount,
	normalizeDecimals,
	toBaseUnits,
} from "../src/module/tokenAmount";

describe("toBaseUnits", () => {
	test("parses the 64-bit maximum exactly", () => {
		expect(toBaseUnits("9223372036854775807")).toBe(9223372036854775807n);
	});
	test("treats empty values as zero", () => {
		expect(toBaseUnits(null)).toBe(0n);
		expect(toBaseUnits(undefined)).toBe(0n);
		expect(toBaseUnits("")).toBe(0n);
	});
	test("rejects unsafe numbers and non-integers", () => {
		// A JavaScript number this large has already lost precision.
		expect(() => toBaseUnits(Number("9223372036854775807"))).toThrow(
			RangeError,
		);
		expect(() => toBaseUnits("1.5")).toThrow(RangeError);
		expect(() => toBaseUnits("1e3")).toThrow(RangeError);
	});
});

describe("formatTokenAmount", () => {
	test("keeps every digit of large supplies", () => {
		expect(formatTokenAmount("9223372036854775807")).toBe(
			"9,223,372,036,854,775,807",
		);
		expect(formatTokenAmount(9223372036854775807n - 9223372036854773807n)).toBe(
			"2,000",
		);
	});
	test("applies decimals without rounding", () => {
		expect(formatTokenAmount("123456789", 8)).toBe("1.23456789");
		expect(formatTokenAmount("100000000", 8)).toBe("1");
		expect(formatTokenAmount("1", 8)).toBe("0.00000001");
		expect(formatTokenAmount("9223372036854775807", 18)).toBe(
			"9.223372036854775807",
		);
		expect(formatTokenAmount("123456789012", 2)).toBe("1,234,567,890.12");
	});
	test("handles zero and negatives", () => {
		expect(formatTokenAmount(0n, 6)).toBe("0");
		expect(formatTokenAmount(-1500n, 3)).toBe("-1.5");
	});
	test("can omit grouping", () => {
		expect(formatTokenAmount("1234567", 0, { grouping: false })).toBe(
			"1234567",
		);
	});
	test("ignores invalid decimals", () => {
		expect(normalizeDecimals(19)).toBe(0);
		expect(normalizeDecimals(2.5)).toBe(0);
		expect(normalizeDecimals("8")).toBe(0);
		expect(normalizeDecimals(8)).toBe(8);
	});
});

describe("formatSatoshisAsBch", () => {
	test("never uses exponential notation", () => {
		expect(formatSatoshisAsBch("1")).toBe("0.00000001");
		expect(formatSatoshisAsBch("546")).toBe("0.00000546");
		expect(formatSatoshisAsBch("2100000000000000")).toBe("21000000");
	});
});
