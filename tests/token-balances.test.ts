import { expect, test } from "bun:test";
import { exactTokenAmount } from "../src/module/tokenBalances";

test("integer scalar boundaries retain strings and safe numbers, rejecting untrusted values", () => {
	for (const amount of [
		"0",
		"9007199254740993",
		"72624976668144285",
		"9223372036854775807",
		0,
		Number.MAX_SAFE_INTEGER,
	]) {
		expect(exactTokenAmount(amount)).toBe(String(amount));
	}
	expect(exactTokenAmount(null)).toBe("0");
	for (const amount of [
		-1,
		1.5,
		Number.MAX_SAFE_INTEGER + 1,
		JSON.parse("9007199254740993"),
		true,
		{},
		[],
		"1e3",
		"-1",
		"NaN",
		"",
	]) {
		expect(() => exactTokenAmount(amount)).toThrow("unsafe integer");
	}
});
