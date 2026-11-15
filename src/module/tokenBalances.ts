import BigNumber from "bignumber.js";
import type {
	GetTokenBalanceBlockQuery,
	GetTokenBalanceOutputsQuery,
	Output_Bool_Exp,
} from "../graphql/graphql";

export class TokenBalanceError extends Error {}

/** JSON numbers above the safe integer range have already lost information. */
export function exactTokenAmount(value: unknown) {
	if (value === null || value === undefined) return "0";
	if (typeof value === "string" && /^\d+$/.test(value)) return value;
	if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0)
		return String(value);
	throw new TokenBalanceError("Invalid or unsafe integer scalar.");
}

/** Read one confirmed-chain snapshot, never a page subtotal. Include spent outputs only for genesis totals. */
export async function loadTokenBalances(
	scope: { network: string; filter: Output_Bool_Exp; includeSpent?: boolean },
	queries: {
		block: (
			height?: string,
			node?: number,
		) => Promise<GetTokenBalanceBlockQuery["block"]>;
		outputs: (
			where: Output_Bool_Exp,
		) => Promise<GetTokenBalanceOutputsQuery["output"]>;
	},
	signal: AbortSignal,
) {
	const tip = (await queries.block()).at(0);
	if (!tip) throw new TokenBalanceError("No accepted block is available.");
	const node = tip.accepted_by[0]?.node_internal_id;
	if (!Number.isSafeInteger(node) || node === undefined || node < 0)
		throw new TokenBalanceError("No accepted node is available.");
	const height = exactTokenAmount(tip.height);
	const confirmed = {
		block_inclusions: {
			block: {
				height: { _lte: height },
				accepted_by: { node_internal_id: { _eq: node } },
			},
		},
	};
	const outputs = new Map<
		string,
		GetTokenBalanceOutputsQuery["output"][number]
	>();
	const cursor: { after: Output_Bool_Exp[] } = { after: [] };
	while (true) {
		signal.throwIfAborted();
		const page = await queries.outputs({
			_and: [scope.filter, ...cursor.after],
			token_category: { _is_null: false },
			transaction: confirmed,
			_not: scope.includeSpent
				? undefined
				: { spent_by: { transaction: confirmed } },
		});
		signal.throwIfAborted();
		// Continue even after a short page: servers may cap the requested limit.
		if (page.length === 0) break;
		const last = page.at(-1);
		if (!last) break;
		const key = `${last.transaction_hash}:${last.output_index}`;
		if (outputs.has(key)) {
			throw new TokenBalanceError("The balance query did not advance.");
		}
		for (const output of page) {
			outputs.set(
				`${output.transaction_hash}:${exactTokenAmount(output.output_index)}`,
				{
					...output,
					fungible_token_amount: exactTokenAmount(output.fungible_token_amount),
				},
			);
		}
		cursor.after = [
			{
				_or: [
					{ transaction_hash: { _gt: last.transaction_hash } },
					{
						transaction_hash: { _eq: last.transaction_hash },
						output_index: { _gt: last.output_index },
					},
				],
			},
		];
	}
	const accepted = (await queries.block(height, node)).at(0);
	signal.throwIfAborted();
	if (
		accepted?.hash !== tip.hash ||
		accepted?.accepted_by[0]?.node_internal_id !== node
	) {
		throw new TokenBalanceError(
			"The accepted chain changed. Refresh balances.",
		);
	}
	return {
		status: "ready" as const,
		height: tip.height,
		outputs: [...outputs.values()],
	};
}

/** Group only after all outputs are loaded; NFT-bearing outputs can hold FT too. */
export function groupTokenBalances(
	outputs: GetTokenBalanceOutputsQuery["output"],
	by: "token_category" | "locking_bytecode",
) {
	const balances = new Map<string, BigNumber>();
	for (const output of outputs) {
		const key = output[by];
		if (!key) continue;
		balances.set(
			key,
			(balances.get(key) || new BigNumber("0")).plus(
				exactTokenAmount(output.fungible_token_amount),
			),
		);
	}
	return [...balances]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, amount]) => ({
			key,
			amount: amount.toFixed(),
		}));
}

export function summarizeTokenBalances(
	outputs: GetTokenBalanceOutputsQuery["output"],
) {
	return outputs.reduce(
		(total, output) => ({
			fungible: total.fungible.plus(
				exactTokenAmount(output.fungible_token_amount),
			),
			nfts: total.nfts.plus(output.nonfungible_token_capability ? "1" : "0"),
			minting:
				total.minting || output.nonfungible_token_capability === "minting",
		}),
		{ fungible: new BigNumber("0"), nfts: new BigNumber("0"), minting: false },
	);
}
