import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { type DocumentNode, getOperationAST, parse } from "graphql";
import { createPinia, setActivePinia } from "pinia";
import { computed, effectScope, nextTick, ref } from "vue";
import type { bytea } from "../src/types";

Object.assign(globalThis, {
	ref,
	computed,
	gql: parse,
	useSubscription: () => ({ result: ref() }),
});
const { useTokenSupply } = await import("../src/hooks/tokenSupply");
const { useStateStore } = await import("../src/store/state");
const category = "ab".repeat(32);
const categoryBytes: bytea = `\\x${category}`;
const tip: bytea = `\\x${"ff".repeat(32)}`;
const genesis = {
	internal_id: "1",
	hash: `\\x${"01".repeat(32)}`,
	input_count: "1",
	output_count: "1",
	inputs: [
		{
			input_index: "0",
			outpoint_index: "0",
			outpoint_transaction_hash: categoryBytes,
			outpoint: { token_category: null, fungible_token_amount: null },
		},
	],
	outputs: [
		{
			output_index: "0",
			token_category: categoryBytes,
			fungible_token_amount: "100",
			locking_bytecode: "\\x51",
		},
	],
};
const scopes: ReturnType<typeof effectScope>[] = [];
beforeEach(() => setActivePinia(createPinia()));
afterEach(() => {
	for (const scope of scopes.splice(0)) scope.stop();
});

function start(
	query: (options: {
		query: DocumentNode | string;
		variables: Record<string, string | number>;
	}) => Promise<unknown>,
	selected = ref<string>(),
) {
	Object.assign(globalThis, {
		useApollo: () => ({ clients: { default: { query } } }),
	});
	const scope = effectScope();
	scopes.push(scope);
	const result = scope.run(() => useTokenSupply(ref(category), selected));
	if (!result) throw new Error("Missing effect scope result");
	return result;
}
function operation(query: DocumentNode | string) {
	return getOperationAST(typeof query === "string" ? parse(query) : query)?.name
		?.value;
}
function response(
	name: string | undefined,
	variables: Record<string, string | number>,
	verified = true,
) {
	if (name === "GetSupplySnapshot")
		return {
			data: {
				node: [
					{
						internal_id: variables.network === "chipnet" ? 9 : 7,
						name: String(variables.network),
						accepted_blocks: [{ block: { hash: tip, height: "200" } }],
					},
				],
			},
		};
	if (name === "GetSupplyTransactions")
		return { data: { transaction: variables.cursor === "0" ? [genesis] : [] } };
	if (name === "GetSupplyAuthhead")
		return {
			data: {
				transaction: [{ authchains: [{ authhead: { hash: genesis.hash } }] }],
			},
		};
	if (name === "GetSupplyReserve")
		return {
			data: {
				transaction: [
					{
						outputs: [
							{
								token_category: categoryBytes,
								fungible_token_amount: "10",
								locking_bytecode: "\\x51",
								spent_by: [],
							},
						],
					},
				],
			},
		};
	return { data: { node_block: verified ? [{ block: { hash: tip } }] : [] } };
}
async function settle() {
	await nextTick();
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("supply request lifecycle", () => {
	test("uses one network/node/height and publishes circulation only after snapshot verification", async () => {
		const requests: {
			name: string | undefined;
			variables: Record<string, string | number>;
		}[] = [];
		const flow = start(async ({ query, variables }) => {
			const name = operation(query);
			requests.push({ name, variables });
			return response(name, variables);
		});
		expect(flow.calculation.value.status).toBe("loading");
		await settle();
		expect(flow.calculation.value).toMatchObject({
			status: "ready",
			height: "200",
			node: "mainnet",
			reserve: 10n,
			supply: { current: 100n, burned: 0n },
		});
		expect(flow.circulation.value).toBe(90n);
		expect(requests[0]).toEqual({
			name: "GetSupplySnapshot",
			variables: { network: "mainnet" },
		});
		for (const request of requests.filter(
			(item) => item.name !== "GetSupplySnapshot",
		)) {
			expect(request.variables.node).toBe(7);
			if (request.name !== "VerifySupplySnapshot")
				expect(request.variables.height).toBe("200");
		}
		expect(requests.at(-1)).toEqual({
			name: "VerifySupplySnapshot",
			variables: { node: 7, hash: tip },
		});
	});

	test("a reorganization discards previously calculated totals", async () => {
		const flow = start(async ({ query, variables }) =>
			response(operation(query), variables, false),
		);
		await settle();
		expect(flow.calculation.value).toMatchObject({
			status: "unknown",
			reason: expect.stringContaining("chain changed"),
		});
		expect(flow.circulation.value).toBeNull();
		expect(flow.calculation.value).not.toHaveProperty("supply");
	});

	test("an indexer failure exposes unknown and supports an explicit retry", async () => {
		const server = { available: false };
		const flow = start(async ({ query, variables }) => {
			if (!server.available) throw new Error("Fixture indexer unavailable");
			return response(operation(query), variables);
		});
		await settle();
		expect(flow.calculation.value.status).toBe("unknown");
		server.available = true;
		flow.recalculate();
		await settle();
		expect(flow.calculation.value.status).toBe("ready");
	});

	test("a late response from another network cannot overwrite the current result", async () => {
		const old = Promise.withResolvers<ReturnType<typeof response>>();
		const flow = start(async ({ query, variables }) => {
			if (
				operation(query) === "GetSupplySnapshot" &&
				variables.network === "mainnet"
			)
				return old.promise;
			return response(operation(query), variables);
		});
		useStateStore().network = "chipnet";
		await settle();
		expect(flow.calculation.value).toMatchObject({
			status: "ready",
			node: "chipnet",
		});
		old.resolve(response("GetSupplySnapshot", { network: "mainnet" }));
		await settle();
		expect(flow.calculation.value).toMatchObject({
			status: "ready",
			node: "chipnet",
		});
	});

	test("an unavailable BCMR authhead preserves burn data but leaves circulation unknown", async () => {
		const flow = start(async ({ query, variables }) =>
			operation(query) === "GetSupplyAuthhead"
				? { data: { transaction: [] } }
				: response(operation(query), variables),
		);
		await settle();
		expect(flow.calculation.value).toMatchObject({
			status: "ready",
			reserve: null,
			supply: { burned: 0n },
		});
		expect(flow.circulation.value).toBeNull();
	});
});

test("selected authhead changes recalculate reserves without treating all issuer balances as reserves", async () => {
	const selected = ref("01".repeat(32));
	const calls: string[] = [];
	const result = start(async ({ query, variables }) => {
		const name = operation(query);
		if (name === "GetSupplyAuthhead")
			return {
				data: {
					transaction: [
						{
							authchains: [
								{ authhead: { hash: genesis.hash } },
								{ authhead: { hash: `\\x${"02".repeat(32)}` } },
							],
						},
					],
				},
			};
		if (name === "GetSupplyReserve") calls.push(String(variables.head));
		return response(name, variables);
	}, selected);
	await settle();
	expect(result.calculation.value.status).toBe("ready");
	expect(calls).toEqual([genesis.hash]);
	selected.value = "02".repeat(32);
	expect(result.calculation.value.status).toBe("loading");
	await settle();
	expect(calls).toEqual([genesis.hash, `\\x${"02".repeat(32)}`]);
	selected.value = "03".repeat(32);
	await settle();
	const final = result.calculation.value;
	expect(final.status).toBe("ready");
	if (final.status === "ready") expect(final.reserve).toBeNull();
	expect(result.circulation.value).toBeNull();
});
