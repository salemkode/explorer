import { describe, expect, test } from "bun:test";
import {
	blazePromoDismissKey,
	parseFlag,
	shouldShowBlazePromo,
} from "../src/module/blazePromo";

const base = {
	enabled: true,
	id: "bchblaze-2026",
	url: "https://dorahacks.io/hackathon/bchblaze2026/detail",
	until: "2026-11-29T00:00:00Z",
	projectPage: false,
};
const before = new Date("2026-11-20T00:00:00Z");

describe("shouldShowBlazePromo", () => {
	test("shows when enabled, not dismissed and not expired", () => {
		expect(shouldShowBlazePromo(base, null, before)).toBe(true);
	});

	test("hides when the flag is off or config is missing", () => {
		expect(
			shouldShowBlazePromo({ ...base, enabled: false }, null, before),
		).toBe(false);
		expect(shouldShowBlazePromo(undefined, null, before)).toBe(false);
	});

	test("hides after the user dismisses this campaign only", () => {
		expect(shouldShowBlazePromo(base, blazePromoDismissKey(base), before)).toBe(
			false,
		);
		expect(shouldShowBlazePromo(base, "older-campaign", before)).toBe(true);
	});

	test("dismissal sticks even without a campaign id", () => {
		const noId = { ...base, id: "" };
		expect(shouldShowBlazePromo(noId, blazePromoDismissKey(noId), before)).toBe(
			false,
		);
	});

	test("expires exactly at the until time", () => {
		const until = new Date(base.until);
		expect(
			shouldShowBlazePromo(base, null, new Date(until.getTime() - 1)),
		).toBe(true);
		expect(shouldShowBlazePromo(base, null, until)).toBe(false);
	});

	test("empty until never expires; an invalid until fails closed", () => {
		expect(
			shouldShowBlazePromo(
				{ ...base, until: "" },
				null,
				new Date("2030-01-01T00:00:00Z"),
			),
		).toBe(true);
		expect(
			shouldShowBlazePromo({ ...base, until: "29/11/2026" }, null, before),
		).toBe(false);
	});

	test("rejects non-http urls", () => {
		expect(
			shouldShowBlazePromo(
				{ ...base, url: "javascript:alert(1)" },
				null,
				before,
			),
		).toBe(false);
		expect(shouldShowBlazePromo({ ...base, url: "" }, null, before)).toBe(
			false,
		);
	});
});

describe("parseFlag", () => {
	test("parses env-style values", () => {
		expect(parseFlag("false", true)).toBe(false);
		expect(parseFlag("OFF", true)).toBe(false);
		expect(parseFlag("disabled", true)).toBe(false);
		expect(parseFlag("1", false)).toBe(true);
		expect(parseFlag("enabled", false)).toBe(true);
		expect(parseFlag("", true)).toBe(true);
		expect(parseFlag(undefined, false)).toBe(false);
		expect(parseFlag("maybe", true)).toBe(true);
	});
});
