import * as v from "valibot";
import type {
	GetSupplyReserveQuery,
	GetSupplyTransactionsQuery,
} from "~/graphql/graphql";

// Hasura may serialize small bigints as JSON numbers. Accept only safe integers;
// a rounded JSON number can never be repaired with BigInt after parsing.
const integer = v.union([
	v.pipe(
		v.string(),
		v.regex(/^(0|[1-9]\d*)$/),
		v.transform((value) => BigInt(value)),
	),
	v.pipe(
		v.number(),
		v.integer(),
		v.minValue(0),
		v.maxValue(Number.MAX_SAFE_INTEGER),
		v.transform((value) => BigInt(value)),
	),
]);
const bytea = v.pipe(v.string(), v.regex(/^\\x(?:[0-9a-f]{2})*$/i));
const hash = v.pipe(v.string(), v.regex(/^\\x[0-9a-f]{64}$/i));
const token = v.object({
	token_category: v.nullable(hash),
	fungible_token_amount: v.nullable(integer),
});
const transactionSchema = v.object({
	internal_id: integer,
	hash,
	input_count: integer,
	output_count: integer,
	inputs: v.array(
		v.object({
			input_index: integer,
			outpoint_index: integer,
			outpoint_transaction_hash: hash,
			outpoint: v.nullable(token),
		}),
	),
	outputs: v.array(
		v.object({
			output_index: integer,
			...token.entries,
			locking_bytecode: bytea,
		}),
	),
});

// These prefixes fail regardless of the unlocking script. Do not classify
// unfamiliar scripts, zero BCH outputs, or "burn addresses" as proof of a burn.
export function isProvablyUnspendable(bytecode: string) {
	const hex = bytecode.slice(2).toLowerCase();
	return hex.startsWith("6a") || hex.startsWith("006a");
}

export function analyzeSupplyTransaction(
	transaction: unknown,
	category: string,
) {
	const parsed = v.safeParse(transactionSchema, transaction);
	if (!parsed.success) {
		return {
			status: "unknown" as const,
			reason: "The indexer returned missing or invalid transaction data.",
		};
	}
	const tx = parsed.output;
	const completeInputs =
		tx.input_count === BigInt(tx.inputs.length) &&
		tx.inputs.every(
			(input, index) =>
				input.input_index === BigInt(index) && input.outpoint !== null,
		);
	const completeOutputs =
		tx.output_count === BigInt(tx.outputs.length) &&
		tx.outputs.every((output, index) => output.output_index === BigInt(index));
	if (!completeInputs || !completeOutputs) {
		return {
			status: "unknown" as const,
			reason:
				"The indexer returned truncated inputs, outputs, or missing previous outputs.",
		};
	}
	const inputs = tx.inputs.reduce(
		(sum, input) =>
			input.outpoint?.token_category?.toLowerCase() === category.toLowerCase()
				? sum + (input.outpoint.fungible_token_amount ?? 0n)
				: sum,
		0n,
	);
	const outputs = tx.outputs.filter(
		(output) => output.token_category?.toLowerCase() === category.toLowerCase(),
	);
	const outputAmount = outputs.reduce(
		(sum, output) => sum + (output.fungible_token_amount ?? 0n),
		0n,
	);
	const genesis = tx.inputs.some(
		(input) =>
			input.outpoint_index === 0n &&
			input.outpoint_transaction_hash.toLowerCase() === category.toLowerCase(),
	);
	if (outputAmount > inputs && !genesis) {
		return {
			status: "unknown" as const,
			reason: "Token amounts do not reconcile with genesis-only issuance.",
		};
	}
	const implicitBurn = inputs > outputAmount ? inputs - outputAmount : 0n;
	const explicitBurn = outputs.reduce(
		(sum, output) =>
			isProvablyUnspendable(output.locking_bytecode)
				? sum + (output.fungible_token_amount ?? 0n)
				: sum,
		0n,
	);
	return {
		status: "complete" as const,
		id: tx.internal_id,
		hash: tx.hash,
		genesis,
		issued: genesis ? outputAmount : 0n,
		implicitBurn,
		explicitBurn,
	};
}

/** Empty-page termination handles indexers whose page cap is below our limit. */
export async function scanTokenSupply(
	category: string,
	readPage: (
		cursor: string,
	) => Promise<GetSupplyTransactionsQuery["transaction"]>,
	options = { maxPages: 200, signal: new AbortController().signal },
) {
	const seen = new Set<string>();
	const totals = {
		issued: 0n,
		implicitBurn: 0n,
		explicitBurn: 0n,
		genesisCount: 0,
		transactions: 0,
	};

	const position = { cursor: 0n, exhausted: false };
	for (const _page of Array.from({ length: options.maxPages })) {
		if (options.signal.aborted)
			return {
				status: "unknown" as const,
				reason: "The supply calculation was cancelled.",
			};
		const transactions = await readPage(position.cursor.toString());
		if (options.signal.aborted)
			return {
				status: "unknown" as const,
				reason: "The supply calculation was cancelled.",
			};
		if (transactions.length === 0) {
			position.exhausted = true;
			break;
		}
		for (const transaction of transactions) {
			const result = analyzeSupplyTransaction(transaction, category);
			if (result.status === "unknown") return result;
			if (result.id <= position.cursor || seen.has(result.hash)) {
				return {
					status: "unknown" as const,
					reason:
						"The indexer repeated or reordered a history page. Totals are unavailable.",
				};
			}
			seen.add(result.hash);
			position.cursor = result.id;
			totals.issued += result.issued;
			totals.implicitBurn += result.implicitBurn;
			totals.explicitBurn += result.explicitBurn;
			totals.genesisCount += Number(result.genesis);
			totals.transactions += 1;
		}
	}
	if (!position.exhausted)
		return {
			status: "unknown" as const,
			reason: "The history exceeds the scan limit. Totals are unavailable.",
		};

	if (totals.genesisCount !== 1) {
		return {
			status: "unknown" as const,
			reason:
				"A unique confirmed genesis transaction was not found in the indexed history.",
		};
	}
	const burned = totals.implicitBurn + totals.explicitBurn;
	if (burned > totals.issued) {
		return {
			status: "unknown" as const,
			reason:
				"Detected burns exceed issuance. The indexed history is inconsistent.",
		};
	}
	return {
		status: "complete" as const,
		...totals,
		burned,
		// Already excludes the detected burns; never subtract them again.
		current: totals.issued - burned,
	};
}

export function circulationAfterReserve(current: bigint, reserve: bigint) {
	return reserve >= 0n && reserve <= current ? current - reserve : null;
}

export function formatTokenSupply(amount: bigint, decimals: number) {
	const digits = amount.toString().padStart(decimals + 1, "0");
	return decimals === 0
		? digits
		: `${digits.slice(0, -decimals)}.${digits.slice(-decimals)}`;
}

export function confirmedReserveAmount(
	response: GetSupplyReserveQuery,
	category: string,
) {
	const output = response.transaction.at(0)?.outputs.at(0);
	if (!output) return null;
	const amount = v.safeParse(v.nullable(integer), output.fungible_token_amount);
	if (!amount.success) return null;
	if (
		output.spent_by.length > 0 ||
		output.token_category?.toLowerCase() !== category.toLowerCase() ||
		isProvablyUnspendable(output.locking_bytecode)
	)
		return 0n;
	return amount.output ?? 0n;
}
