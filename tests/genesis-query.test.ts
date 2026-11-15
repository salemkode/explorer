import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { buildSchema, defaultFieldResolver, execute } from "graphql";
import { ref, watch } from "vue";
import { GetAuthChainsDocument } from "../src/graphql/graphql";
import { chainResponse, tokenA } from "./helpers/token-fixtures";

Object.assign(globalThis, { ref, watch });
const { decodeAuthChain } = await import("../src/module/bcmr");
const schema = buildSchema(
	readFileSync(
		new URL("../schema/chaingraph.graphql", import.meta.url),
		"utf8",
	),
);

test("the generated auth-chain query retains later genesis-authorizing inputs", async () => {
	for (const index of ["0", 0]) {
		const data = chainResponse(tokenA);
		const transaction =
			data.transaction[0]?.authchains[0]?.migrations[0]?.transaction[0];
		if (!transaction) throw new Error("Missing genesis fixture");
		const authorizingInput = transaction.inputs[0];
		if (!authorizingInput) throw new Error("Missing authorizing input");
		Object.defineProperty(authorizingInput, "outpoint_index", { value: index });
		transaction.inputs.unshift(
			{
				outpoint_transaction_hash: `\\x${"11".repeat(32)}`,
				outpoint_index: "3",
			},
			{
				outpoint_transaction_hash: `\\x${"22".repeat(32)}`,
				outpoint_index: "0",
			},
		);
		const fetchedInputs = [transaction.inputs];
		const result = await execute({
			schema,
			document: GetAuthChainsDocument,
			variableValues: { network: "mainnet", tokenCategory: [`\\x${tokenA}`] },
			rootValue: data,
			fieldResolver(source, args, context, info) {
				if (info.fieldName !== "inputs") {
					return defaultFieldResolver(source, args, context, info);
				}
				// Model the backend's filtering and row cap from the actual query.
				// Returning every fixture input would hide the original limit: 1 bug.
				const matching = transaction.inputs.filter(
					(input) =>
						args.where?.outpoint_index?._eq === undefined ||
						String(input.outpoint_index) ===
							String(args.where.outpoint_index._eq),
				);
				const selected = matching.slice(0, args.limit ?? matching.length);
				fetchedInputs.push(selected);
				return selected;
			},
		});
		expect(result.errors).toBeUndefined();
		const selected = fetchedInputs.at(-1);
		if (!selected) throw new Error("Query did not resolve inputs");
		transaction.inputs.splice(0, transaction.inputs.length, ...selected);
		expect(decodeAuthChain(data, tokenA)?.genesesTx.genesisSupply).toBe("100");
	}
});
