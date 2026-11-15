import { describe, expect, test } from "bun:test";
import { computed, ref, watch } from "vue";

const response = ref<unknown>();
Object.assign(globalThis, {
	computed,
	ref,
	watch,
	useFetch: () => ({ data: response }),
});
const { useUsdPrice } = await import("../src/hooks/usdPrice");

describe("USD price formatting with BigNumber 11", () => {
	test("pending and failed prices keep BCH amounts usable", () => {
		for (const unavailable of [
			undefined,
			null,
			{},
			{ error: "rate limited" },
		]) {
			response.value = unavailable;
			const price = useUsdPrice();
			expect(price.calculatePrice("100000000")).toBe("0");
			expect(price.formatPrice("100000000")).toBe("1 BCH");
		}
	});

	test("validated prices include the USD amount", () => {
		response.value = { "bitcoin-cash": { usd: 500 } };
		const price = useUsdPrice();
		expect(price.formatPrice("100000000")).toBe("1 BCH • $500");
		expect(price.formatPrice("0")).toBeUndefined();
	});
});
