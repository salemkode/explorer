import { describe, expect, test } from "bun:test";
import { ref } from "vue";
import {
	BLOCK_STALE_AFTER,
	FEED_STALE_AFTER,
	formatBlockAge,
	useNetworkStatus,
} from "../src/composables/useNetworkStatus";
import type { MonitorHomeNetworkSubscription } from "../src/graphql/graphql";

const currentTime = Date.UTC(2026, 10, 14, 12);
function nodeFixture(
	overrides: Partial<
		MonitorHomeNetworkSubscription["block"][number]["accepted_by"][number]["node"]
	> = {},
	blockOverrides: Partial<
		Omit<MonitorHomeNetworkSubscription["block"][number], "accepted_by">
	> = {},
) {
	return {
		block: [
			{
				height: "900001",
				timestamp: String(currentTime / 1000 - 90),
				...blockOverrides,
				accepted_by: [
					{
						node: {
							name: "bchn-mainnet",
							user_agent: "/BCHN:29.0.0/",
							unconfirmed_transaction_count: "42",
							unconfirmed_transactions: [
								{
									validated_at: null,
									transaction: {
										hash: "\\x1234",
										is_coinbase: false,
										input_value_satoshis: "10000",
										output_value_satoshis: "9500",
										inputs: [],
										outputs: [],
									},
								},
							],
							...overrides,
						},
					},
				],
			},
		],
	} satisfies MonitorHomeNetworkSubscription;
}

function setup() {
	const now = ref(currentTime);
	return { now, feed: useNetworkStatus(now) };
}

describe("homepage node status", () => {
	test("first load has no invented zero height or mempool count", () => {
		const { feed } = setup();
		expect(feed.status.value.type).toBe("connecting");
		expect(feed.tip.value).toBeUndefined();
		expect(feed.node.value).toBeUndefined();
		expect(feed.updatedAt.value).toBeUndefined();
	});

	test("accepted tip and bounded recent transactions come from the same node", () => {
		const { feed } = setup();
		feed.receive(nodeFixture());
		expect(feed.status.value.type).toBe("live");
		expect(feed.tip.value?.height).toBe("900001");
		expect(feed.blockAge.value).toBe("1 minute ago");
		expect(feed.node.value?.name).toBe("bchn-mainnet");
		expect(feed.node.value?.unconfirmed_transaction_count).toBe("42");
		expect(feed.transactions.value.map((tx) => tx.hash)).toEqual(["\\x1234"]);
	});

	test("a reported empty mempool is a real zero, not a missing response", () => {
		const { feed } = setup();
		feed.receive(
			nodeFixture({
				unconfirmed_transaction_count: "0",
				unconfirmed_transactions: [],
			}),
		);
		expect(feed.status.value.type).toBe("live");
		expect(feed.node.value?.unconfirmed_transaction_count).toBe("0");
		expect(feed.transactions.value).toEqual([]);
		feed.receive({ block: [] });
		expect(feed.status.value.type).toBe("empty");
		expect(feed.tip.value).toBeUndefined();
		expect(feed.node.value).toBeUndefined();
	});

	test("missing accepted tip and mempool count remain unavailable", () => {
		const { feed } = setup();
		feed.receive(nodeFixture({ unconfirmed_transaction_count: null }));
		expect(feed.node.value?.unconfirmed_transaction_count).toBeNull();
		feed.receive({ block: [] });
		expect(feed.tip.value).toBeUndefined();
		expect(feed.blockAge.value).toBe("Unavailable");
	});

	test("an initial failure is unavailable, never zero activity", () => {
		const { feed } = setup();
		feed.fail();
		expect(feed.status.value.type).toBe("error");
		expect(feed.node.value).toBeUndefined();
		expect(feed.tip.value).toBeUndefined();
	});

	test("disconnect and terminal error retain the last snapshot until a fresh result", () => {
		const { feed } = setup();
		feed.receive(nodeFixture());
		feed.reconnect();
		expect(feed.status.value.type).toBe("reconnecting");
		expect(feed.node.value?.unconfirmed_transaction_count).toBe("42");
		feed.fail();
		expect(feed.status.value.type).toBe("error");
		expect(feed.tip.value?.height).toBe("900001");
		feed.reconnect();
		expect(feed.status.value.type).toBe("reconnecting");
		feed.receive(nodeFixture());
		expect(feed.status.value.type).toBe("live");
	});

	test("elapsed time alone updates the age and makes a silent feed stale", () => {
		const { feed, now } = setup();
		feed.receive(nodeFixture());
		now.value += FEED_STALE_AFTER - 1;
		expect(feed.status.value.type).toBe("live");
		now.value += 1;
		expect(feed.status.value.type).toBe("stale");
		expect(feed.blockAge.value).toBe("6 minutes ago");
		feed.receive(nodeFixture());
		expect(feed.status.value.type).toBe("live");
		expect(feed.updatedAt.value).toBe(now.value);
	});

	test("an old accepted tip remains stale even when mempool updates arrive", () => {
		const { feed, now } = setup();
		const fixture = nodeFixture(
			{},
			{ timestamp: String((currentTime - BLOCK_STALE_AFTER) / 1000) },
		);
		feed.receive(fixture);
		expect(feed.status.value.type).toBe("oldTip");
		now.value += 60_000;
		feed.receive(fixture);
		expect(feed.status.value.type).toBe("oldTip");
		feed.receive(nodeFixture({}, { timestamp: String(now.value / 1000) }));
		expect(feed.status.value.type).toBe("live");
	});

	test("a reorg can replace the current tip with a lower accepted height", () => {
		const { feed } = setup();
		feed.receive(nodeFixture());
		const replacement = nodeFixture({}, { height: "900000" });
		feed.receive(replacement);
		expect(feed.tip.value?.height).toBe("900000");
	});

	test("a new network feed starts empty and cannot share the previous network snapshot", () => {
		const mainnet = setup();
		mainnet.feed.receive(nodeFixture());
		const chipnet = setup();
		expect(chipnet.feed.status.value.type).toBe("connecting");
		expect(chipnet.feed.node.value).toBeUndefined();
		mainnet.feed.receive(nodeFixture());
		expect(chipnet.feed.node.value).toBeUndefined();
		const fixture = nodeFixture({ name: "bchn-chipnet" }, { height: "250000" });
		chipnet.feed.receive(fixture);
		expect(chipnet.feed.tip.value?.height).toBe("250000");
		expect(chipnet.feed.node.value?.name).toBe("bchn-chipnet");
	});
});

describe("block timestamp ages", () => {
	for (const [seconds, expected] of [
		[0, "Less than a minute ago"],
		[59, "Less than a minute ago"],
		[60, "1 minute ago"],
		[120, "2 minutes ago"],
		[3599, "59 minutes ago"],
		[3600, "1 hour ago"],
		[7200, "2 hours ago"],
		[86400, "1 day ago"],
		[172800, "2 days ago"],
		[-120, "In the future"],
	] as const) {
		test(`${expected} (${seconds}s)`, () => {
			expect(formatBlockAge(currentTime / 1000 - seconds, currentTime)).toBe(
				expected,
			);
		});
	}
	test("invalid or missing timestamps are unavailable", () => {
		expect(formatBlockAge(undefined, currentTime)).toBe("Unavailable");
		expect(formatBlockAge(Number.NaN, currentTime)).toBe("Unavailable");
	});
});
