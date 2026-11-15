import { describe, expect, test } from "bun:test";
import { effectScope, nextTick, ref } from "vue";
import type {
	GetTokenBalanceOutputsQuery,
	Output_Bool_Exp,
	Transaction_Bool_Exp,
} from "../src/graphql/graphql";
import { useTokenBalanceSnapshot } from "../src/hooks/tokenBalances";
import {
	groupTokenBalances,
	loadTokenBalances,
	summarizeTokenBalances,
	TokenBalanceError,
} from "../src/module/tokenBalances";

const category = "\\xaaaa";
const foreignCategory = "\\xbbbb";
const script = "\\x0011";

function output(
	hash: string,
	index: string,
	amount: string | null,
	capability: GetTokenBalanceOutputsQuery["output"][number]["nonfungible_token_capability"] = null,
) {
	return {
		transaction_hash: `\\x${hash}` as const,
		output_index: index,
		token_category: category,
		locking_bytecode: script,
		fungible_token_amount: amount,
		nonfungible_token_capability: capability,
	} satisfies GetTokenBalanceOutputsQuery["output"][number];
}

function confirmed(network = "mainnet", height = "90", accepted = true) {
	return { network, height, accepted, node: network === "chipnet" ? 2 : 1 };
}

function fixture(
	row: GetTokenBalanceOutputsQuery["output"][number],
	transaction = confirmed(),
	spentBy: ReturnType<typeof confirmed>[] = [],
) {
	return { row, transaction, spentBy };
}

const firstOutput = output("01", "2", "9007199254740993");
const fixtures = [
	fixture(firstOutput),
	fixture(output("01", "10", "7", "mutable")),
	fixture(output("02", "0", "5", "none"), confirmed(), [confirmed("chipnet")]),
	fixture(output("03", "0", "3", "minting"), confirmed(), [
		confirmed("mainnet", "101"),
	]),
	fixture(output("04", "0", null, "none")),
	fixture(output("05", "0", "11"), confirmed(), [
		confirmed("mainnet", "80", false),
	]),
	fixture(output("06", "0", "100"), confirmed("chipnet")),
	fixture(output("07", "0", "200"), confirmed("mainnet", "80", false)),
	fixture(output("08", "0", "300"), confirmed(), [confirmed()]),
	fixture(output("09", "0", "400"), confirmed("mainnet", "101")),
	fixture({ ...output("0a", "0", "13"), token_category: foreignCategory }),
	fixture({ ...output("0b", "0", "17"), locking_bytecode: "\\x0022" }),
];

// Fixture backend: model accepted-chain relationships and Hasura's keyset predicates.
function matchesTransaction(
	transaction: ReturnType<typeof confirmed>,
	where: Transaction_Bool_Exp,
) {
	const block = where.block_inclusions?.block;
	if (!block) return true;
	const network = block.accepted_by?.node?.name?._regex;
	return (
		transaction.accepted &&
		(!block.accepted_by?.node_internal_id?._eq ||
			transaction.node === block.accepted_by.node_internal_id._eq) &&
		(!network || new RegExp(network).test(transaction.network)) &&
		(!block.height?._lte ||
			BigInt(transaction.height) <= BigInt(block.height._lte))
	);
}

function matches(item: (typeof fixtures)[number], where: Output_Bool_Exp) {
	const { row } = item;
	if (where._and && !where._and.every((filter) => matches(item, filter)))
		return false;
	if (where._or && !where._or.some((filter) => matches(item, filter)))
		return false;
	if (
		where.transaction &&
		!matchesTransaction(item.transaction, where.transaction)
	)
		return false;
	const spend = where._not?.spent_by?.transaction;
	if (
		spend &&
		item.spentBy.some((transaction) => matchesTransaction(transaction, spend))
	)
		return false;
	if (
		where.token_category?._eq &&
		row.token_category !== where.token_category._eq
	)
		return false;
	if (
		where.locking_bytecode?._eq &&
		row.locking_bytecode !== where.locking_bytecode._eq
	)
		return false;
	if (
		where.transaction_hash?._eq &&
		row.transaction_hash !== where.transaction_hash._eq
	)
		return false;
	if (
		where.transaction_hash?._gt &&
		row.transaction_hash <= where.transaction_hash._gt
	)
		return false;
	if (
		where.output_index?._gt &&
		BigInt(row.output_index) <= BigInt(where.output_index._gt)
	)
		return false;
	return true;
}

function backend(rows = fixtures) {
	const calls: Output_Bool_Exp[] = [];
	return {
		calls,
		async block() {
			return [
				{
					hash: "\\xdead" as const,
					height: "100",
					accepted_by: [{ node_internal_id: 1 }],
				},
			];
		},
		async outputs(where: Output_Bool_Exp) {
			calls.push(where);
			// Deliberately cap at two rows, less than the production request limit.
			return rows
				.filter((item) => matches(item, where))
				.sort(
					(a, b) =>
						a.row.transaction_hash.localeCompare(b.row.transaction_hash) ||
						Number(BigInt(a.row.output_index) - BigInt(b.row.output_index)),
				)
				.slice(0, 2)
				.map((item) => item.row);
		},
	};
}

const scope = {
	network: "mainnet",
	filter: { token_category: { _eq: category } },
} satisfies Parameters<typeof loadTokenBalances>[0];

async function load(
	queries: Parameters<typeof loadTokenBalances>[1] = backend(),
	current: Parameters<typeof loadTokenBalances>[0] = scope,
) {
	return loadTokenBalances(current, queries, new AbortController().signal);
}

describe("complete, exact confirmed token balances", () => {
	test("reads all capped pages, including the empty terminator and same-tx output indices", async () => {
		const queries = backend();
		const snapshot = await load(queries);
		expect(snapshot.height).toBe("100");
		expect(
			snapshot.outputs.map(
				(row) => `${row.transaction_hash}:${row.output_index}`,
			),
		).toEqual([
			"\\x01:2",
			"\\x01:10",
			"\\x02:0",
			"\\x03:0",
			"\\x04:0",
			"\\x05:0",
			"\\x0b:0",
		]);
		expect(queries.calls).toHaveLength(5);
		const totals = summarizeTokenBalances(snapshot.outputs);
		expect(totals.fungible.toFixed()).toBe("9007199254741036");
		expect(totals.nfts.toFixed()).toBe("4");
		expect(totals.minting).toBe(true);
		expect(groupTokenBalances(snapshot.outputs, "locking_bytecode")).toEqual([
			{ key: script, amount: "9007199254741019" },
			{ key: "\\x0022", amount: "17" },
		]);
	});

	test("aggregates an address across categories and pages, including FT in NFT outputs", async () => {
		const snapshot = await loadTokenBalances(
			{ network: "mainnet", filter: { locking_bytecode: { _eq: script } } },
			backend(),
			new AbortController().signal,
		);
		expect(groupTokenBalances(snapshot.outputs, "token_category")).toEqual([
			{ key: category, amount: "9007199254741019" },
			{ key: foreignCategory, amount: "13" },
		]);
	});

	test("complete genesis scans include spent outputs and exclude foreign categories", async () => {
		const queries = backend([
			fixture(output("01", "0", "9007199254740993"), confirmed(), [
				confirmed(),
			]),
			fixture(output("01", "1", "7", "mutable")),
			fixture({ ...output("01", "2", "99"), token_category: foreignCategory }),
			fixture(output("02", "0", "200")),
		]);
		const snapshot = await load(queries, {
			...scope,
			includeSpent: true,
			filter: {
				token_category: { _eq: category },
				transaction_hash: { _eq: "\\x01" },
			},
		});
		expect(snapshot.outputs).toHaveLength(2);
		expect(snapshot.outputs[0]?.output_index).toBe("0");
		expect(summarizeTokenBalances(snapshot.outputs).fungible.toFixed()).toBe(
			"9007199254741000",
		);
	});

	test("re-fetching the same snapshot replaces totals rather than adding them", async () => {
		const queries = backend();
		const first = await load(queries);
		const second = await load(queries);
		expect(groupTokenBalances(second.outputs, "locking_bytecode")).toEqual(
			groupTokenBalances(first.outputs, "locking_bytecode"),
		);
	});

	test("a repeated page fails visibly instead of doubling or looping forever", async () => {
		const queries = backend();
		await expect(
			load({ ...queries, outputs: async () => [firstOutput] }),
		).rejects.toThrow("did not advance");
	});

	test("empty is an exact zero, while an error after a partial page has no total", async () => {
		const empty = await load(backend([]));
		expect(empty.outputs).toEqual([]);
		expect(summarizeTokenBalances(empty.outputs).fungible.toFixed()).toBe("0");
		const queries = backend();
		await expect(
			load({
				...queries,
				outputs: async (where) => {
					if (queries.calls.length > 0) throw new TokenBalanceError("Offline");
					return queries.outputs(where);
				},
			}),
		).rejects.toThrow("Offline");
	});

	test("rejects a changed or unavailable accepted block", async () => {
		const queries = backend();
		await expect(load({ ...queries, block: async () => [] })).rejects.toThrow(
			"No accepted block",
		);
		await expect(
			load({
				...queries,
				block: async (height?: string) =>
					height
						? [
								{
									hash: "\\xbeef",
									height,
									accepted_by: [{ node_internal_id: 1 }],
								},
							]
						: queries.block(),
			}),
		).rejects.toThrow("accepted chain changed");
	});

	test("network selection changes both creation and spending semantics", async () => {
		const snapshot = await load(
			{
				...backend(),
				block: async () => [
					{
						hash: "\\xdead",
						height: "100",
						accepted_by: [{ node_internal_id: 2 }],
					},
				],
			},
			{ ...scope, network: "chipnet" },
		);
		expect(summarizeTokenBalances(snapshot.outputs).fungible.toFixed()).toBe(
			"100",
		);
	});
});

async function settle() {
	await new Promise((resolve) => setTimeout(resolve, 0));
	await nextTick();
}

describe("snapshot lifecycle", () => {
	test("clears ready values on refresh; partial failure stays unavailable; retry is idempotent", async () => {
		const owner = effectScope();
		const current = ref<Parameters<typeof loadTokenBalances>[0]>(scope);
		const control = { fail: false };
		const result = owner.run(() =>
			useTokenBalanceSnapshot(current, (selected, signal) => {
				if (control.fail)
					return Promise.reject(new TokenBalanceError("Offline"));
				return loadTokenBalances(selected, backend(), signal);
			}),
		);
		if (!result) throw new TokenBalanceError("Missing test scope");
		try {
			expect(result.state.value.status).toBe("loading");
			await settle();
			const initial = result.state.value;
			expect(initial.status).toBe("ready");
			control.fail = true;
			result.refresh();
			expect(result.state.value).toEqual({ status: "loading" });
			await settle();
			expect(result.state.value.status).toBe("error");
			control.fail = false;
			result.refresh();
			await settle();
			expect(result.state.value).toEqual(initial);
		} finally {
			owner.stop();
		}
	});

	test("does not request incomplete genesis scopes", async () => {
		const owner = effectScope();
		const calls: string[] = [];
		const result = owner.run(() =>
			useTokenBalanceSnapshot(ref(null), async () => {
				calls.push("loaded");
				return { status: "ready", height: "100", outputs: [] };
			}),
		);
		try {
			await settle();
			expect(result?.state.value).toEqual({ status: "unavailable" });
			expect(calls).toEqual([]);
		} finally {
			owner.stop();
		}
	});

	test("category/network changes and disposal discard late responses", async () => {
		const owner = effectScope();
		const current = ref<Parameters<typeof loadTokenBalances>[0]>(scope);
		const pending: {
			signal: AbortSignal;
			resolve: (value: Awaited<ReturnType<typeof loadTokenBalances>>) => void;
		}[] = [];
		const result = owner.run(() =>
			useTokenBalanceSnapshot(
				current,
				(_, signal) =>
					new Promise((resolve) => pending.push({ signal, resolve })),
			),
		);
		if (!result) throw new TokenBalanceError("Missing test scope");
		try {
			current.value = { ...scope, network: "chipnet" };
			expect(pending[0]?.signal.aborted).toBe(true);
			expect(result.state.value.status).toBe("loading");
			pending[1]?.resolve({ status: "ready", height: "2", outputs: [] });
			await settle();
			pending[0]?.resolve({
				status: "ready",
				height: "1",
				outputs: [firstOutput],
			});
			await settle();
			expect(result.state.value).toEqual({
				status: "ready",
				height: "2",
				outputs: [],
			});
			current.value = {
				...scope,
				filter: { token_category: { _eq: foreignCategory } },
			};
			expect(result.state.value).toEqual({ status: "loading" });
			owner.stop();
			expect(pending[2]?.signal.aborted).toBe(true);
			pending[2]?.resolve({ status: "ready", height: "3", outputs: [] });
			await settle();
			expect(result.state.value.status).toBe("loading");
		} finally {
			owner.stop();
		}
	});
});

test("raw JSON unsafe numeric amounts cannot become an exact ready snapshot", async () => {
	const row = output("01", "0", "0");
	Object.defineProperty(row, "fungible_token_amount", {
		value: JSON.parse("9007199254740993"),
	});
	await expect(load(backend([fixture(row)]))).rejects.toThrow("unsafe integer");
});

test("integer scalar boundaries retain strings and safe numbers, rejecting untrusted values", () => {
	for (const amount of [
		"0",
		"9007199254740993",
		"72624976668144285",
		"9223372036854775807",
		0,
		Number.MAX_SAFE_INTEGER,
	]) {
		const row = output("01", "0", "0");
		Object.defineProperty(row, "fungible_token_amount", { value: amount });
		expect(groupTokenBalances([row], "token_category")[0]?.amount).toBe(
			String(amount),
		);
	}
	for (const amount of [
		-1,
		1.5,
		Number.MAX_SAFE_INTEGER + 1,
		true,
		{},
		[],
		"1e3",
		"-1",
		"NaN",
		"",
	]) {
		const row = output("01", "0", "0");
		Object.defineProperty(row, "fungible_token_amount", { value: amount });
		expect(() => summarizeTokenBalances([row])).toThrow("unsafe integer");
	}
});

test("one accepted node scopes creation, spends, and final snapshot verification", async () => {
	const first = { ...confirmed(), node: 1 };
	const competing = { ...confirmed(), node: 3 };
	const queries = backend([
		fixture(output("01", "0", "100"), first, [competing]),
		fixture(output("02", "0", "100"), competing),
		fixture(output("03", "0", "100"), first, [{ ...first, accepted: false }]),
	]);
	const verification: (number | undefined)[] = [];
	const snapshot = await load({
		...queries,
		block: async (_height, node) => {
			verification.push(node);
			return queries.block();
		},
	});
	expect(summarizeTokenBalances(snapshot.outputs).fungible.toFixed()).toBe(
		"200",
	);
	expect(verification).toEqual([undefined, 1]);
	for (const where of queries.calls) {
		expect(
			where.transaction?.block_inclusions?.block?.accepted_by?.node_internal_id
				?._eq,
		).toBe(1);
		expect(
			where._not?.spent_by?.transaction?.block_inclusions?.block?.accepted_by
				?.node_internal_id?._eq,
		).toBe(1);
	}
	await expect(
		load({
			...queries,
			block: async (height) =>
				height
					? [
							{
								hash: "\\xdead",
								height,
								accepted_by: [{ node_internal_id: 3 }],
							},
						]
					: queries.block(),
		}),
	).rejects.toThrow("accepted chain changed");
});
