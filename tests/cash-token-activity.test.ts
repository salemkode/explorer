import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { buildSchema, graphql, print, validate } from "graphql";
import type { GetCashTokenActivityQuery } from "../src/graphql/graphql";
import { GetCashTokenActivityDocument } from "../src/graphql/graphql";
import {
	cashTokenActivityLimits,
	cashTokenActivityName,
	cashTokenActivityVariables,
	cashTokenCategoryPage,
	summarizeCashTokenActivity,
} from "../src/module/cashTokenActivity";
import type { bytea } from "../src/types";

const categoryA = `\\x${"a".repeat(64)}` as const;
const categoryB = `\\x${"b".repeat(64)}` as const;

function output(
	category: bytea | null,
	index = "0",
	values: Partial<
		GetCashTokenActivityQuery["block"][number]["transactions"][number]["transaction"]["outputs"][number]
	> = {},
) {
	return {
		output_index: index,
		token_category: category,
		fungible_token_amount: null,
		nonfungible_token_capability: null,
		...values,
	};
}

function transaction(
	txid: string,
	outputs: GetCashTokenActivityQuery["block"][number]["transactions"][number]["transaction"]["outputs"],
) {
	return {
		transaction: { hash: `\\x${txid.padStart(64, "0")}` as const, outputs },
	};
}

function block(
	height: string,
	transactions: GetCashTokenActivityQuery["block"][number]["transactions"],
) {
	return {
		hash: `\\x${height.padStart(64, "0")}` as const,
		height,
		timestamp: "1730000000",
		transactions,
	};
}

describe("bounded CashToken output activity", () => {
	test("counts transactions once globally and once per category, with exact per-category raw units", () => {
		const first = transaction("1", [
			output(categoryA, "0", { fungible_token_amount: "9007199254740993" }),
			output(categoryA, "1", { fungible_token_amount: "7" }),
			output(categoryB, "2", { fungible_token_amount: "2" }),
		]);
		const summary = summarizeCashTokenActivity([
			block("200", [
				first,
				transaction("2", [
					output(categoryA, "0", {
						fungible_token_amount: "9223372036854775807",
					}),
				]),
			]),
		]);
		expect(summary.transactionCount).toBe(2);
		expect(summary.categories).toEqual([
			{
				category: categoryA.slice(2),
				latestTxid: first.transaction.hash.slice(2),
				transactionCount: 2,
				fungibleUnits: "9232379236109516807",
				nftOutputs: 0,
				mintingOutputs: 0,
			},
			{
				category: categoryB.slice(2),
				latestTxid: first.transaction.hash.slice(2),
				transactionCount: 1,
				fungibleUnits: "2",
				nftOutputs: 0,
				mintingOutputs: 0,
			},
		]);
		expect(summary.truncated).toBe(false);
	});

	test("distinguishes NFT-only, FT-only and mixed outputs; minting capability is an output count", () => {
		const summary = summarizeCashTokenActivity([
			block("200", [
				transaction("1", [
					output(categoryA, "0", { nonfungible_token_capability: "none" }),
					output(categoryA, "1", { nonfungible_token_capability: "mutable" }),
					output(categoryA, "2", {
						nonfungible_token_capability: "minting",
						fungible_token_amount: "5",
					}),
					output(categoryA, "3", { fungible_token_amount: "7" }),
				]),
			]),
		]);
		expect(summary.categories[0]).toMatchObject({
			transactionCount: 1,
			fungibleUnits: "12",
			nftOutputs: 3,
			mintingOutputs: 1,
		});
		expect(summary.nftOutputs).toBe(3);
	});

	test("deduplicates identical outpoints and transactions across block inclusions without losing distinct outputs", () => {
		const tx = transaction("1", [
			output(categoryA, "0", {
				nonfungible_token_capability: "none",
				fungible_token_amount: "3",
			}),
			output(categoryA, "1", { fungible_token_amount: "4" }),
		]);
		const summary = summarizeCashTokenActivity([
			block("200", [tx, tx]),
			block("199", [tx]),
		]);
		expect(summary.transactionCount).toBe(1);
		expect(summary.categories[0]).toMatchObject({
			transactionCount: 1,
			fungibleUnits: "7",
			nftOutputs: 1,
		});
	});

	test("empty windows and non-token outputs are not fabricated activity", () => {
		expect(summarizeCashTokenActivity([])).toMatchObject({
			blocks: [],
			categories: [],
			transactionCount: 0,
			truncated: false,
		});
		expect(
			summarizeCashTokenActivity([
				block("200", []),
				block("199", [transaction("1", [output(null)])]),
			]),
		).toMatchObject({ categories: [], transactionCount: 0, nftOutputs: 0 });
	});

	test("uses only the accepted block window supplied, including empty blocks; keeps newest observed category transaction", () => {
		const summary = summarizeCashTokenActivity([
			block("200", []),
			block("199", [transaction("2", [output(categoryB)])]),
			block("198", [
				transaction("1", [output(categoryB), output(categoryA, "1")]),
			]),
			block("197", [
				transaction("3", [
					output(categoryA, "0", { fungible_token_amount: "999" }),
				]),
			]),
		]);
		expect(summary.blocks.map((item) => item.height)).toEqual([
			"200",
			"199",
			"198",
		]);
		expect(summary.categories.map((item) => item.category)).toEqual([
			categoryB.slice(2),
			categoryA.slice(2),
		]);
		expect(summary.categories[0]?.latestTxid).toBe("2".padStart(64, "0"));
		expect(summary.transactionCount).toBe(2);
		expect(summary.categories[1]?.fungibleUnits).toBe("0");
	});

	test("transaction sentinel signals a partial sample but never contributes to categories or totals", () => {
		const summary = summarizeCashTokenActivity([
			block("200", [
				...Array.from(
					{ length: cashTokenActivityLimits.transactionsPerBlock },
					(_, index) => transaction(String(index), [output(categoryA)]),
				),
				transaction("999", [
					output(categoryB, "0", { fungible_token_amount: "999999" }),
				]),
			]),
		]);
		expect(summary.truncated).toBe(true);
		expect(summary.transactionCount).toBe(20);
		expect(summary.categories.map((item) => item.category)).toEqual([
			categoryA.slice(2),
		]);
	});

	test("output sentinel signals truncation; exact limit alone does not", () => {
		const outputs = Array.from(
			{ length: cashTokenActivityLimits.outputsPerTransaction },
			(_, index) =>
				output(categoryA, String(index), { fungible_token_amount: "1" }),
		);
		const complete = summarizeCashTokenActivity([
			block("200", [transaction("1", outputs)]),
		]);
		const sampled = summarizeCashTokenActivity([
			block("200", [
				transaction("1", [
					...outputs,
					output(categoryB, "50", { nonfungible_token_capability: "minting" }),
				]),
			]),
		]);
		expect(complete.truncated).toBe(false);
		expect(sampled.truncated).toBe(true);
		expect(sampled.categories).toEqual(complete.categories);
		expect(sampled.nftOutputs).toBe(0);
		expect(sampled.categories[0]?.fungibleUnits).toBe("50");
	});

	test("category pages do not alter window totals and clamp when the refreshed window shrinks", () => {
		const summary = summarizeCashTokenActivity([
			block("200", [
				transaction(
					"1",
					Array.from({ length: 19 }, (_, index) =>
						output(`\\x${String(index).padStart(64, "0")}`, String(index)),
					),
				),
			]),
		]);
		const first = cashTokenCategoryPage(summary.categories, 1);
		const second = cashTokenCategoryPage(summary.categories, 2);
		const third = cashTokenCategoryPage(summary.categories, 99);
		expect([first.rows.length, second.rows.length, third.rows.length]).toEqual([
			8, 8, 3,
		]);
		expect(
			new Set(
				[...first.rows, ...second.rows, ...third.rows].map(
					(row) => row.category,
				),
			).size,
		).toBe(19);
		expect(summary.transactionCount).toBe(1);
		expect(
			cashTokenCategoryPage(summary.categories.slice(0, 2), 3),
		).toMatchObject({ page: 1, pages: 1 });
		expect(cashTokenCategoryPage([], -1)).toEqual({
			page: 1,
			pages: 1,
			rows: [],
		});
	});
});

describe("optional CashToken registry names", () => {
	test("accepts a matching category's name without trusting decimals or interpreting output units", () => {
		expect(
			cashTokenActivityName(categoryA.slice(2), {
				name: "  Example token  ",
				token: { category: categoryA.slice(2), decimals: "invalid" },
			}),
		).toBe("Example token");
	});

	test.each([
		undefined,
		null,
		{},
		{ name: " " },
		{ name: 123 },
		{ name: "Wrong category", token: { category: categoryB.slice(2) } },
		{ name: "x".repeat(121), token: { category: categoryA.slice(2) } },
	])(
		"missing or invalid metadata uses an explicit fallback: %j",
		(identity) => {
			expect(cashTokenActivityName(categoryA.slice(2), identity)).toBe(
				"Unnamed token",
			);
		},
	);
});

test("activity query validates against the checked-in schema and executes bounded, ordered, network-filtered selections", async () => {
	const schema = buildSchema(
		await readFile(
			new URL("../schema/chaingraph.graphql", import.meta.url),
			"utf8",
		),
	);
	expect(validate(schema, GetCashTokenActivityDocument)).toEqual([]);
	const requested = { blocks: 0, transactions: 0, outputs: 0 };
	const response = await graphql({
		schema,
		source: print(GetCashTokenActivityDocument),
		variableValues: cashTokenActivityVariables("chipnet"),
		rootValue: {
			block(args: { limit: number; where: unknown; order_by: unknown }) {
				requested.blocks = args.limit;
				expect(args.where).toEqual({
					accepted_by: { node: { name: { _regex: "chipnet" } } },
				});
				expect(args.order_by).toEqual([{ height: "desc" }, { hash: "asc" }]);
				return [
					{
						...block("200", []),
						transactions(args: {
							limit: number;
							where: unknown;
							order_by: unknown;
						}) {
							requested.transactions = args.limit;
							expect(args.where).toEqual({
								transaction: {
									outputs: { token_category: { _is_null: false } },
								},
							});
							expect(args.order_by).toEqual([{ transaction_index: "desc" }]);
							return [
								{
									transaction: {
										...transaction("1", []).transaction,
										outputs(args: {
											limit: number;
											where: unknown;
											order_by: unknown;
										}) {
											requested.outputs = args.limit;
											expect(args.where).toEqual({
												token_category: { _is_null: false },
											});
											expect(args.order_by).toEqual([{ output_index: "asc" }]);
											return [
												output(categoryA, "0", {
													fungible_token_amount: "9007199254740993",
												}),
											];
										},
									},
								},
							];
						},
					},
				];
			},
		},
	});
	expect(response.errors).toBeUndefined();
	expect(requested).toEqual({ blocks: 3, transactions: 21, outputs: 51 });
	expect(response.data?.block).toBeDefined();
});
