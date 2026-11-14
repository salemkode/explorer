import { describe, expect, test } from "bun:test";
import type { GetSupplyTransactionsQuery } from "../src/graphql/graphql";
import {
	analyzeSupplyTransaction,
	circulationAfterReserve,
	confirmedReserveAmount,
	formatTokenSupply,
	isProvablyUnspendable,
	scanTokenSupply,
} from "../src/module/tokenSupply";
import type { bytea } from "../src/types";

const category: bytea = `\\x${"ab".repeat(32)}`;
const other: bytea = `\\x${"cd".repeat(32)}`;

function tokenOutput(
	amount: string | null,
	tokenCategory: bytea | null = category,
	lockingBytecode: bytea = "\\x51",
) {
	return {
		token_category: tokenCategory,
		fungible_token_amount: amount,
		locking_bytecode: lockingBytecode,
	};
}
function tokenInput(
	amount: string | null,
	tokenCategory: bytea | null = category,
	hash: bytea = other,
	index = "1",
) {
	return {
		outpoint_transaction_hash: hash,
		outpoint_index: index,
		outpoint: { token_category: tokenCategory, fungible_token_amount: amount },
	};
}
function transaction(
	id: number,
	inputs: ReturnType<typeof tokenInput>[],
	outputs: ReturnType<typeof tokenOutput>[],
) {
	return {
		internal_id: String(id),
		hash: `\\x${id.toString(16).padStart(64, "0")}`,
		input_count: String(inputs.length),
		output_count: String(outputs.length),
		inputs: inputs.map((input, index) => ({
			...input,
			input_index: String(index),
		})),
		outputs: outputs.map((output, index) => ({
			...output,
			output_index: String(index),
		})),
	} satisfies GetSupplyTransactionsQuery["transaction"][number];
}
function genesis(amount = "100") {
	return transaction(
		1,
		[tokenInput(null, null, category, "0")],
		[tokenOutput(amount)],
	);
}
async function scan(transactions: GetSupplyTransactionsQuery["transaction"]) {
	return scanTokenSupply(category, async (cursor) =>
		transactions.filter((tx) => BigInt(tx.internal_id) > BigInt(cursor)),
	);
}

describe("confirmed fungible burn accounting", () => {
	test("genesis and transfers conserve supply; NFT-only amounts are zero", async () => {
		const result = await scan([
			genesis(),
			transaction(
				2,
				[tokenInput("100")],
				[tokenOutput("100"), tokenOutput(null)],
			),
		]);
		expect(result).toMatchObject({
			status: "complete",
			issued: 100n,
			burned: 0n,
			current: 100n,
		});
	});

	test("partial input/output loss reduces remaining supply once", async () => {
		const result = await scan([
			genesis(),
			transaction(2, [tokenInput("100")], [tokenOutput("60")]),
		]);
		expect(result).toMatchObject({
			status: "complete",
			implicitBurn: 40n,
			burned: 40n,
			current: 60n,
		});
		if (result.status !== "complete") return;
		expect(circulationAfterReserve(result.current, 10n)).toBe(50n);
	});

	test("full burns with no category output are included", async () => {
		const result = await scan([
			genesis(),
			transaction(2, [tokenInput("100")], [tokenOutput(null, null)]),
		]);
		expect(result).toMatchObject({
			status: "complete",
			burned: 100n,
			current: 0n,
		});
	});

	test("issuance and burns are isolated from other categories in the same transaction", async () => {
		const issuance = transaction(
			1,
			[tokenInput(null, null, category, "0")],
			[tokenOutput("100"), tokenOutput("500", other)],
		);
		const spending = transaction(
			2,
			[tokenInput("100"), tokenInput("500", other)],
			[tokenOutput("80"), tokenOutput("1", other, "\\x6a")],
		);
		expect(await scan([issuance, spending])).toMatchObject({
			status: "complete",
			issued: 100n,
			burned: 20n,
			explicitBurn: 0n,
			current: 80n,
		});
	});

	test("genesis authorization can be any input with outpoint index zero", async () => {
		const issuance = transaction(
			1,
			[tokenInput(null, null), tokenInput(null, null, category, "0")],
			[tokenOutput("100")],
		);
		expect(await scan([issuance])).toMatchObject({
			status: "complete",
			issued: 100n,
		});
	});

	test("explicit unspendable outputs and implicit loss do not overlap", async () => {
		const burn = transaction(
			2,
			[tokenInput("100")],
			[
				tokenOutput("20"),
				tokenOutput("10", category, "\\x6a04deadbeef"),
				tokenOutput("30", category, "\\x006a"),
			],
		);
		expect(await scan([genesis(), burn])).toMatchObject({
			status: "complete",
			implicitBurn: 40n,
			explicitBurn: 40n,
			burned: 80n,
			current: 20n,
		});
	});

	test("explicit burns at genesis count even without a later spend", async () => {
		const issuance = transaction(
			1,
			[tokenInput(null, null, category, "0")],
			[tokenOutput("100", category, "\\x6a")],
		);
		expect(await scan([issuance])).toMatchObject({
			status: "complete",
			issued: 100n,
			burned: 100n,
			current: 0n,
		});
	});

	test("large amounts and decimal formatting remain exact", async () => {
		const result = await scan([
			genesis("9223372036854775807"),
			transaction(
				2,
				[tokenInput("9223372036854775807")],
				[tokenOutput("9007199254740993")],
			),
		]);
		expect(result).toMatchObject({
			status: "complete",
			burned: 9214364837600034814n,
			current: 9007199254740993n,
		});
		expect(formatTokenSupply(9007199254740993n, 2)).toBe("90071992547409.93");
		expect(formatTokenSupply(1n, 18)).toBe("0.000000000000000001");
		expect(formatTokenSupply(0n, 0)).toBe("0");
	});

	test("Hasura safe JSON integers work, but rounded numeric amounts remain unknown", () => {
		const tx = genesis();
		const numeric = {
			...tx,
			internal_id: 1,
			input_count: 1,
			output_count: 1,
			inputs: tx.inputs.map((input) => ({
				...input,
				input_index: 0,
				outpoint_index: 0,
			})),
			outputs: tx.outputs.map((output) => ({
				...output,
				output_index: 0,
				fungible_token_amount: 100,
			})),
		};
		expect(analyzeSupplyTransaction(numeric, category)).toMatchObject({
			status: "complete",
			issued: 100n,
		});
		expect(
			analyzeSupplyTransaction(
				{
					...numeric,
					outputs: numeric.outputs.map((output) => ({
						...output,
						fungible_token_amount: Number.MAX_SAFE_INTEGER + 1,
					})),
				},
				category,
			),
		).toMatchObject({ status: "unknown" });
	});

	test("only defensible script prefixes count; pushed or conditional OP_RETURN is not proof", () => {
		for (const script of ["\\x6a", "\\x006a", "\\x6A01ff"])
			expect(isProvablyUnspendable(script)).toBe(true);
		for (const script of [
			"\\x016a",
			"\\x00636a6851",
			"\\x76a914",
			"\\x51",
			"\\x",
		])
			expect(isProvablyUnspendable(script)).toBe(false);
	});

	test("missing history, malformed amounts and invalid inflation stay unknown", async () => {
		expect(await scan([])).toMatchObject({ status: "unknown" });
		expect(
			await scan([transaction(2, [tokenInput("100")], [tokenOutput("50")])]),
		).toMatchObject({ status: "unknown" });
		expect(await scan([genesis("1e6")])).toMatchObject({ status: "unknown" });
		expect(
			await scan([
				genesis(),
				transaction(2, [tokenInput("100")], [tokenOutput("101")]),
			]),
		).toMatchObject({ status: "unknown" });
	});

	test("truncated arrays, missing outpoints and incorrect indices never imply burns", () => {
		const tx = transaction(2, [tokenInput("100")], [tokenOutput("60")]);
		expect(
			analyzeSupplyTransaction({ ...tx, output_count: "2" }, category),
		).toMatchObject({ status: "unknown" });
		expect(
			analyzeSupplyTransaction({ ...tx, input_count: null }, category),
		).toMatchObject({ status: "unknown" });
		expect(
			analyzeSupplyTransaction(
				{
					...tx,
					inputs: [
						{
							...tx.inputs[0],
							input_index: "0",
							outpoint_index: "1",
							outpoint_transaction_hash: other,
							outpoint: null,
						},
					],
				},
				category,
			),
		).toMatchObject({ status: "unknown" });
		expect(
			analyzeSupplyTransaction(
				{ ...tx, outputs: [{ ...tokenOutput("60"), output_index: "1" }] },
				category,
			),
		).toMatchObject({ status: "unknown" });
	});
});

describe("bounded cursor pagination", () => {
	test("short pages continue until empty instead of mistaking a server cap for completion", async () => {
		const txs = [
			genesis(),
			transaction(9, [tokenInput("100")], [tokenOutput("75")]),
		];
		const cursors: string[] = [];
		const result = await scanTokenSupply(category, async (cursor) => {
			cursors.push(cursor);
			return txs
				.filter((tx) => BigInt(tx.internal_id) > BigInt(cursor))
				.slice(0, 1);
		});
		expect(cursors).toEqual(["0", "1", "9"]);
		expect(result).toMatchObject({ status: "complete", burned: 25n });
	});

	test("repeated pages cannot double-count balances or loop forever", async () => {
		const result = await scanTokenSupply(category, async () => [genesis()]);
		expect(result).toMatchObject({
			status: "unknown",
			reason: expect.stringContaining("repeated"),
		});
		expect(result).not.toHaveProperty("burned");
	});

	test("duplicate hashes with new IDs, reordered IDs, budget exhaustion and cancellation fail closed", async () => {
		const tx = genesis();
		expect(await scan([tx, { ...tx, internal_id: "2" }])).toMatchObject({
			status: "unknown",
		});
		expect(
			await scan([
				{ ...tx, internal_id: "3" },
				transaction(2, [tokenInput("100")], [tokenOutput("50")]),
			]),
		).toMatchObject({ status: "unknown" });
		expect(
			await scanTokenSupply(category, async () => [tx], {
				maxPages: 1,
				signal: new AbortController().signal,
			}),
		).toMatchObject({
			status: "unknown",
			reason: expect.stringContaining("limit"),
		});
		const controller = new AbortController();
		controller.abort();
		const calls: string[] = [];
		expect(
			await scanTokenSupply(
				category,
				async (cursor) => {
					calls.push(cursor);
					return [];
				},
				{ maxPages: 200, signal: controller.signal },
			),
		).toMatchObject({ status: "unknown" });
		expect(calls).toEqual([]);
	});
});

describe("reserve and circulation", () => {
	function reserve(
		amount = "10",
		script: bytea = "\\x51",
		spent = false,
		tokenCategory: bytea | null = category,
	) {
		return {
			transaction: [
				{
					outputs: [
						{
							...tokenOutput(amount, tokenCategory, script),
							spent_by: spent ? [{ input_index: "0" }] : [],
						},
					],
				},
			],
		};
	}
	test("only a verified unspent reserve of the selected category is subtracted", () => {
		expect(confirmedReserveAmount(reserve(), category)).toBe(10n);
		expect(confirmedReserveAmount(reserve("10", "\\x51", true), category)).toBe(
			0n,
		);
		expect(
			confirmedReserveAmount(reserve("10", "\\x51", false, other), category),
		).toBe(0n);
		expect(confirmedReserveAmount({ transaction: [] }, category)).toBeNull();
		expect(circulationAfterReserve(60n, 61n)).toBeNull();
	});

	test("an already burned reserve is never subtracted from remaining supply again", () => {
		const reserveAmount = confirmedReserveAmount(
			reserve("40", "\\x6a"),
			category,
		);
		expect(reserveAmount).toBe(0n);
		if (reserveAmount !== null)
			expect(circulationAfterReserve(60n, reserveAmount)).toBe(60n);
	});
});
