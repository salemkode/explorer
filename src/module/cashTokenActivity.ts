import {
	literal,
	maxLength,
	minLength,
	object,
	pipe,
	safeParse,
	string,
	trim,
} from "valibot";
import type { GetCashTokenActivityQuery } from "~/graphql/graphql";

export const cashTokenActivityLimits = {
	blocks: 3,
	transactionsPerBlock: 20,
	outputsPerTransaction: 50,
	categoriesPerPage: 8,
};

export function cashTokenActivityVariables(network: string) {
	return {
		network,
		blocks: cashTokenActivityLimits.blocks,
		// One extra row detects truncation; sentinels never enter the metrics.
		transactions: cashTokenActivityLimits.transactionsPerBlock + 1,
		outputs: cashTokenActivityLimits.outputsPerTransaction + 1,
	};
}

export function summarizeCashTokenActivity(
	blocks: GetCashTokenActivityQuery["block"],
) {
	const window = blocks.slice(0, cashTokenActivityLimits.blocks);
	const transactions = window.flatMap((block) =>
		block.transactions.slice(0, cashTokenActivityLimits.transactionsPerBlock),
	);
	const outputs = transactions.flatMap(({ transaction }) =>
		transaction.outputs
			.slice(0, cashTokenActivityLimits.outputsPerTransaction)
			.flatMap((output) =>
				output.token_category
					? [
							{
								category: output.token_category.slice(2),
								txid: transaction.hash.slice(2),
								output,
							},
						]
					: [],
			),
	);
	const categories = new Map(
		outputs.map(({ category, txid }) => [
			category,
			{
				category,
				latestTxid: txid,
				transactions: new Set<string>(),
				fungibleUnits: 0n,
				nftOutputs: 0,
				mintingOutputs: 0,
			},
		]),
	);
	const seenOutputs = new Set<string>();
	const seenTransactions = new Set<string>();
	for (const { category, txid, output } of outputs) {
		const row = categories.get(category);
		const outputId = `${txid}:${output.output_index}`;
		if (!row || seenOutputs.has(outputId)) continue;
		seenOutputs.add(outputId);
		seenTransactions.add(txid);
		// The query orders blocks and transactions newest first.
		if (row.transactions.size === 0) row.latestTxid = txid;
		row.transactions.add(txid);
		if (
			output.fungible_token_amount !== null &&
			output.fungible_token_amount !== undefined
		) {
			row.fungibleUnits += BigInt(output.fungible_token_amount);
		}
		if (
			output.nonfungible_token_capability !== null &&
			output.nonfungible_token_capability !== undefined
		) {
			row.nftOutputs += 1;
		}
		if (output.nonfungible_token_capability === "minting")
			row.mintingOutputs += 1;
	}
	return {
		blocks: window.map(({ hash, height, timestamp }) => ({
			hash: hash.slice(2),
			height,
			timestamp,
		})),
		transactionCount: seenTransactions.size,
		nftOutputs: Array.from(categories.values()).reduce(
			(sum, row) => sum + row.nftOutputs,
			0,
		),
		truncated:
			window.some(
				(block) =>
					block.transactions.length >
					cashTokenActivityLimits.transactionsPerBlock,
			) ||
			transactions.some(
				({ transaction }) =>
					transaction.outputs.length >
					cashTokenActivityLimits.outputsPerTransaction,
			),
		// Keep first-observed order; this is activity, not a popularity ranking.
		categories: Array.from(categories.values(), (row) => ({
			category: row.category,
			latestTxid: row.latestTxid,
			transactionCount: row.transactions.size,
			fungibleUnits: row.fungibleUnits.toString(),
			nftOutputs: row.nftOutputs,
			mintingOutputs: row.mintingOutputs,
		})),
	};
}

export function cashTokenCategoryPage(
	categories: ReturnType<typeof summarizeCashTokenActivity>["categories"],
	requestedPage: number,
) {
	const pages = Math.max(
		1,
		Math.ceil(categories.length / cashTokenActivityLimits.categoriesPerPage),
	);
	const page = Math.min(pages, Math.max(1, Math.trunc(requestedPage)));
	return {
		page,
		pages,
		rows: categories.slice(
			(page - 1) * cashTokenActivityLimits.categoriesPerPage,
			page * cashTokenActivityLimits.categoriesPerPage,
		),
	};
}

// Registry metadata is optional and untrusted. It never changes on-chain units.
export function cashTokenActivityName(category: string, identity: unknown) {
	const parsed = safeParse(
		object({
			name: pipe(string(), trim(), minLength(1), maxLength(120)),
			token: object({ category: literal(category) }),
		}),
		identity,
	);
	return parsed.success ? parsed.output.name : "Unnamed token";
}
