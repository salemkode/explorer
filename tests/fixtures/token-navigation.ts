import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import {
	ApolloClient,
	ApolloLink,
	type FetchResult,
	InMemoryCache,
	Observable,
	type Observer,
	type Operation,
} from "@apollo/client/core";

Object.assign(globalThis, { window: {} });
const { DefaultApolloClient } = await import("@vue/apollo-composable");

import { compileScript, parse } from "@vue/compiler-sfc";
import { createPinia, setActivePinia } from "pinia";
import {
	computed,
	defineComponent,
	h,
	nextTick,
	reactive,
	ref,
	shallowReactive,
	shallowRef,
	toRef,
	watch,
} from "vue";
import {
	chainResponse,
	publication,
	registry,
	tokenA,
	tokenC,
	txB,
	txResponse,
} from "../helpers/token-fixtures";
import { createNode, renderer, textContent } from "../helpers/vue-renderer";

// Compile the actual pages and BCMR card. Only framework auto-imports and unrelated
// child widgets are supplied by the harness; queries use the real Apollo client.
Bun.plugin({
	name: "vue-behavior-tests",
	setup(build) {
		build.onLoad({ filter: /\.vue$/ }, async ({ path }) => {
			const { descriptor } = parse(await Bun.file(path).text(), {
				filename: path,
			});
			return {
				contents: compileScript(descriptor, { id: path, inlineTemplate: true })
					.content,
				loader: "ts",
			};
		});
	},
});

const route = shallowReactive({
	params: { category: tokenA, txid: txB },
	query: {},
});
Object.assign(globalThis, {
	computed,
	ref,
	shallowRef,
	reactive,
	shallowReactive,
	watch,
	toRef,
	onMounted: () => undefined,
	useRoute: () => route,
	useRouter: () => ({
		push: ({ query }: { query: object }) => {
			route.query = query;
		},
	}),
	useSubscription: () => ({ result: ref() }),
	useFetch: () => ({ data: ref() }),
	useRuntimeConfig: () => ({
		public: { ipfsGateway: "https://gateway.example" },
	}),
});
const { gql } = await import("../../src/graphql/gql");
Object.assign(globalThis, { gql });
const { useRegistryStore, useStateStore } = await import("../../src/store");
const { default: TokenPage } = await import(
	"../../src/pages/token/[category].vue"
);
const { default: TxPage } = await import("../../src/pages/tx/[txid].vue");
const { default: TokenAuthChains } = await import(
	"../../src/components/token/AuthChains.vue"
);
const { default: BcmrInfo } = await import(
	"../../src/components/bcmr/Info.vue"
);
const { default: ContentWarp } = await import(
	"../../src/components/ContentWarp.vue"
);

const { GetAuthChains } = await import("../../src/module/chaingraph");
const { decodeAuthChain } = await import("../../src/module/bcmr");

const balanceRows = new Map<
	string,
	Omit<
		import("../../src/graphql/graphql").GetTokenUnspentOutputsQuery["output"][number],
		"transaction"
	>[]
>();
const apolloClients = new Map<
	string,
	ApolloClient<import("@apollo/client/core").NormalizedCacheObject>
>();
Object.assign(globalThis, {
	useApollo: () => ({ clients: { default: apolloClients.get("default") } }),
});
const requests = new Map<Operation, Observer<FetchResult>>();
const cleanup: (() => void)[] = [];

beforeEach(() => {
	requests.clear();
	balanceRows.clear();
	route.params = { category: tokenA, txid: txB };
	route.query = {};
});
afterEach(() => {
	for (const stop of cleanup.splice(0)) stop();
});

async function settle() {
	await nextTick();
	await new Promise((resolve) => setTimeout(resolve, 0));
	await nextTick();
}

function mountPages(initial = "token") {
	const pinia = createPinia();
	setActivePinia(pinia);
	const client = new ApolloClient({
		cache: new InMemoryCache(),
		link: new ApolloLink(
			(operation) =>
				new Observable((observer) => {
					requests.set(operation, observer);
					if (operation.operationName === "GetNetworkNodes") {
						observer.next({ data: { node: [{ internal_id: 1 }] } });
						observer.complete();
					}
					if (
						operation.operationName === "GetTokenIssuingOutputs" ||
						operation.operationName === "GetTokenOpReturnOutputs" ||
						operation.operationName === "GetTokenBurnerOutputs"
					) {
						observer.next({ data: { output: [] } });
						observer.complete();
					}
					if (operation.operationName === "GetTokenUnspentOutputs") {
						const category = operation.variables.tokenCategory;
						const rows = balanceRows.get(category) ?? [
							{
								transaction_hash: "\\xab",
								output_index: "0",
								locking_bytecode: "\\x51",
								fungible_token_amount: "60",
								nonfungible_token_capability: null,
								nonfungible_token_commitment: null,
							},
						];
						const offset = operation.variables.offset ?? 0;
						// Created in a block the network's node accepts.
						const acceptance = {
							node_validations: [],
							block_inclusions: [
								{ block: { accepted_by: [{ node_internal_id: 1 }] } },
							],
						};
						observer.next({
							data: {
								output: rows
									.slice(offset, offset + 5000)
									.map((row) => ({ ...row, transaction: acceptance })),
							},
						});
						observer.complete();
					}
				}),
		),
	});
	apolloClients.set("default", client);
	const page = ref(initial);
	const root = createNode("root");
	const app = renderer.createApp({
		setup: () => () => h(page.value === "token" ? TokenPage : TxPage),
	});
	app.use(pinia);
	app.provide(DefaultApolloClient, client);
	app.component("BcmrInfo", BcmrInfo);
	app.component("TokenAuthChains", TokenAuthChains);
	app.component("ContentWarp", ContentWarp);
	app.component(
		"BaseCopy",
		defineComponent({
			props: ["text"],
			setup: (props) => () => h("span", String(props.text ?? "")),
		}),
	);
	app.component("LoadingView", { render: () => h("p", "Loading details") });
	app.component("LoadingSpinner", { render: () => h("p", "Loading metadata") });
	app.component(
		"NuxtLink",
		defineComponent({
			props: ["to"],
			setup:
				(props, { slots }) =>
				() =>
					h("a", { href: props.to }, slots.default?.()),
		}),
	);
	for (const name of [
		"TokenId",
		"NavPills",
		"TokenProvider",
		"TokenAddress",
		"TokenTransaction",
		"TokenChild",
		"TxConfirm",
		"TransactionListOperation",
		"BcmrIcon",
	]) {
		app.component(name, { render: () => h("div") });
	}
	app.mount(root);
	cleanup.push(() => {
		app.unmount();
		client.stop();
	});
	const store = useRegistryStore();
	store.loadingProviders = false;
	store.registryList = [
		{ name: "AuthChain", url: "auth_chain", enable: true, default: true },
	];
	const fetchMock = spyOn(globalThis, "fetch").mockImplementation(
		Object.assign(
			async () => {
				const category = String(
					route.params.category === tokenA && route.params.txid !== txB
						? route.params.txid
						: route.params.category,
				);
				const cached = store.authchains.get(category);
				return new Response(
					JSON.stringify(
						typeof cached === "object"
							? cached
							: registry(category, "Fixture metadata"),
					),
				);
			},
			{ preconnect: fetch.preconnect },
		),
	);
	cleanup.push(() => fetchMock.mockRestore());
	return { page, store, state: useStateStore(), text: () => textContent(root) };
}

function request(
	name: string,
	category: string,
	network = "mainnet",
	offset = 0,
) {
	const found = Array.from(requests, ([operation, observer]) => ({
		operation,
		observer,
	})).findLast(
		({ operation }) =>
			operation.operationName === name &&
			(operation.variables.network === network ||
				(operation.variables.network === undefined &&
					operation.operationName.startsWith("GetToken")) ||
				operation.variables.where?.transaction?.block_inclusions?.block
					?.accepted_by?.node_internal_id?._eq ===
					(network === "chipnet" ? 2 : 1)) &&
			(operation.variables.hash === `\\x${category}` ||
				operation.variables.tokenCategory === `\\x${category}` ||
				operation.variables.where?._and?.[0]?.token_category?._eq ===
					`\\x${category}` ||
				operation.variables.tokenCategory?.includes(`\\x${category}`)) &&
			(operation.variables.offset || 0) === offset,
	);
	if (!found)
		throw new Error(
			`Missing ${name} for ${category} on ${network}, offset ${offset}`,
		);
	return found;
}

async function answerToken(category: string, network = "mainnet") {
	await settle();
	request("GetAuthChains", category, network).observer.next?.({
		data: chainResponse(category),
	});
	await settle();
}

describe("token and transaction navigation", () => {
	test("token A → transaction B → token C never carries over token metadata", async () => {
		const screen = mountPages();
		await settle();
		screen.store.authchains.set(tokenA, registry(tokenA, "Token Alpha"));
		screen.store.authchains.set(tokenC, registry(tokenC, "Token Charlie"));
		// A cached registry identity alone must not create a BCMR card on a tx.
		screen.store.authchains.set(txB, registry(txB, "Unrelated cached token"));
		await answerToken(tokenA);
		expect(screen.text()).toContain("Token Alpha");
		screen.page.value = "tx";
		await settle();
		expect(screen.text()).not.toContain("Token Alpha");
		request("GetTx", txB).observer.next?.({ data: txResponse(txB) });
		request("GetAuthChains", txB).observer.next?.({ data: chainResponse(txB) });
		await settle();
		expect(screen.text()).toContain(txB);
		expect(screen.text()).not.toContain("Unrelated cached token");
		route.params = { category: tokenC, txid: txB };
		screen.page.value = "token";
		await settle();
		expect(screen.text()).not.toContain("Token Alpha");
		await answerToken(tokenC);
		expect(screen.text()).toContain("Token Charlie");
		expect(screen.text()).not.toContain("Token Alpha");
	});

	test("same token page tracks replaced params; delayed old failure cannot replace C with an error", async () => {
		const screen = mountPages();
		await settle();
		const old = request("GetAuthChains", tokenA);
		const oldSupply = request("GetTokenUnspentOutputs", tokenA);
		screen.store.authchains.set(tokenC, registry(tokenC, "Token Charlie"));
		route.params = { category: tokenC, txid: txB };
		await settle();
		await answerToken(tokenC);
		old.observer.error?.(new Error("Late failure for A"));
		oldSupply.observer.next?.({
			data: {
				output: [
					{
						transaction_hash: "\\xcd",
						output_index: "0",
						locking_bytecode: "\\x51",
						fungible_token_amount: "9999",
						nonfungible_token_capability: null,
					},
				],
			},
		});
		await settle();
		expect(screen.text()).toContain("Token Charlie");
		expect(screen.text()).not.toContain("not found");
		expect(screen.text()).not.toContain("could not be loaded");
		expect(screen.text()).toMatch(/Held In Smart Contracts\s+60/);
		expect(screen.text()).not.toContain("9999");
	});

	test("same tx page removes old cards immediately and ignores late empty responses", async () => {
		const screen = mountPages("tx");
		await settle();
		request("GetTx", txB).observer.next?.({ data: txResponse(txB) });
		request("GetAuthChains", txB).observer.next?.({
			data: { transaction: [] },
		});
		await settle();
		expect(screen.text()).toContain(txB);
		route.params = { category: tokenA, txid: tokenA };
		await settle();
		expect(screen.text()).not.toContain(txB);
		const old = request("GetTx", tokenA);
		route.params = { category: tokenC, txid: tokenC };
		await settle();
		screen.store.authchains.set(tokenC, registry(tokenC, "Token Charlie"));
		request("GetTx", tokenC).observer.next?.({
			data: txResponse(tokenC, publication),
		});
		request("GetAuthChains", tokenC).observer.next?.({
			data: chainResponse(tokenC),
		});
		await settle();
		expect(screen.text()).toContain("Token Charlie");
		old.observer.next?.({ data: { transaction: [], node: [] } });
		await settle();
		expect(screen.text()).toContain(tokenC);
		expect(screen.text()).not.toContain("Transaction Not Found");
	});

	test("current errors and empty results stay distinct and reset on parameter changes", async () => {
		const screen = mountPages("tx");
		await settle();
		request("GetTx", txB).observer.error?.(new Error("Offline"));
		await settle();
		expect(screen.text()).toContain("Transaction details could not be loaded");
		expect(screen.text()).not.toContain("Transaction Not Found");
		route.params = { category: tokenC, txid: tokenC };
		await settle();
		expect(screen.text()).not.toContain("could not be loaded");
		request("GetTx", tokenC).observer.next?.({
			data: { transaction: [], node: [] },
		});
		await settle();
		expect(screen.text()).toContain("Transaction Not Found");
	});

	test("network changes clear auth-chain metadata and request all token queries on the selected network", async () => {
		const screen = mountPages();
		await settle();
		screen.store.authchains.set(tokenA, registry(tokenA, "Mainnet Alpha"));
		await answerToken(tokenA);
		expect(screen.text()).toContain("Mainnet Alpha");
		screen.state.network = "chipnet";
		await settle();
		expect(screen.text()).not.toContain("Mainnet Alpha");
		expect(screen.store.authchains.has(tokenA)).toBe(false);
		// The metadata-fetch race is covered separately below.
		screen.store.authchains.set(tokenA, false);
		await answerToken(tokenA, "chipnet");
		await settle();
		expect(screen.text()).not.toContain("Mainnet Alpha");
	});

	test("a pending registry fetch cannot repopulate a different network, even after switching back", async () => {
		const screen = mountPages();
		await settle();
		const deferred = Promise.withResolvers<Response>();
		const fetchMock = spyOn(globalThis, "fetch").mockImplementation(
			Object.assign(() => deferred.promise, { preconnect: fetch.preconnect }),
		);
		cleanup.push(() => fetchMock.mockRestore());
		screen.store.addToken(tokenA, publication);
		expect(screen.store.authchains.get(tokenA)).toBe(true);
		screen.state.network = "chipnet";
		screen.state.network = "mainnet";
		screen.store.authchains.set(tokenA, false);
		deferred.resolve(
			new Response(JSON.stringify(registry(tokenA, "Late Mainnet Alpha")), {
				status: 200,
			}),
		);
		await settle();
		expect(screen.store.authchains.get(tokenA)).toBe(false);
		expect(screen.text()).not.toContain("Late Mainnet Alpha");
	});

	test("an invalid publication cannot reveal cached token metadata", async () => {
		const screen = mountPages("tx");
		await settle();
		screen.store.authchains.set(txB, registry(txB, "Cached token"));
		request("GetTx", txB).observer.next?.({
			data: txResponse(txB, "6a0442434d52"),
		});
		request("GetAuthChains", txB).observer.next?.({
			data: chainResponse(txB, "6a0442434d52"),
		});
		await settle();
		expect(screen.text()).toContain(txB);
		expect(screen.text()).not.toContain("Cached token");
	});
	test("metadata loading and failure leave token details available", async () => {
		const screen = mountPages();
		await settle();
		const deferred = Promise.withResolvers<Response>();
		const fetchMock = spyOn(globalThis, "fetch").mockImplementation(
			Object.assign(() => deferred.promise, { preconnect: fetch.preconnect }),
		);
		cleanup.push(() => fetchMock.mockRestore());
		await answerToken(tokenA);
		expect(screen.text()).toContain("Genesis Transaction");
		expect(screen.text()).toContain("Loading token metadata");
		deferred.resolve(new Response("Unavailable", { status: 503 }));
		await settle();
		expect(screen.text()).toContain("Genesis Transaction");
		expect(screen.text()).toContain("Auth-chain metadata could not be loaded");
		expect(screen.text()).not.toContain("Loading token metadata");
	});

	test("only a current successful empty token lookup shows token not found", async () => {
		const screen = mountPages();
		await settle();
		request("GetAuthChains", tokenA).observer.error?.(new Error("Offline"));
		await settle();
		expect(screen.text()).toContain("Token details could not be loaded");
		expect(screen.text()).not.toContain("Token not found");
		route.params = { category: tokenC, txid: txB };
		await settle();
		request("GetAuthChains", tokenC).observer.next?.({
			data: { transaction: [] },
		});
		await settle();
		expect(screen.text()).toContain("Token not found");
		expect(screen.text()).not.toContain("could not be loaded");
	});
});

test("complete paged balances count each outpoint once and reset across token changes", async () => {
	// 5,002 distinct outputs over two 5,000-row pages, with one outpoint
	// repeated across the page boundary (unstable paging): it counts once.
	const unique = Array.from({ length: 5002 }, (_, index) => ({
		transaction_hash: "\\xab" as const,
		output_index: String(index),
		locking_bytecode: "\\x51" as const,
		fungible_token_amount: index === 5001 ? "7" : "2",
		nonfungible_token_capability: "none" as const,
		nonfungible_token_commitment: null,
	}));
	balanceRows.set(`\\x${tokenA}`, [
		...unique.slice(0, 5000),
		unique[4999]!,
		...unique.slice(5000),
	]);
	const screen = mountPages();
	await settle();
	await answerToken(tokenA);
	await settle();
	expect(screen.text()).toMatch(/Held In Smart Contracts\s+10,009/);
	expect(screen.text()).toMatch(/Total NFTs\s+5,002/);
	const old = request("GetTokenUnspentOutputs", tokenA, "mainnet", 5000);
	old.observer.next?.({ data: { output: [] } });
	await settle();
	expect(screen.text()).toMatch(/Held In Smart Contracts\s+10,009/);
	route.params = { category: tokenC, txid: txB };
	await settle();
	await answerToken(tokenC);
	expect(screen.text()).toMatch(/Held In Smart Contracts\s+60/);
	expect(screen.text()).not.toContain("10,009");
});

test("genesis checks every authorizing input and rejects BCH-only or foreign category outputs", () => {
	const data: import("../../src/graphql/graphql").GetAuthChainsQuery =
		chainResponse(tokenA);
	const tx =
		data.transaction[0]!.authchains[0]!.migrations[0]!.transaction![0]!;
	tx.inputs.unshift({
		outpoint_transaction_hash: `\\x${txB}`,
		outpoint_index: "0",
	});
	expect(decodeAuthChain(data, tokenA)?.genesesTx.genesisSupply).toBe("100");
	tx.outputs[0]!.fungible_token_amount = "0";
	tx.outputs[0]!.nonfungible_token_capability = "none";
	expect(decodeAuthChain(data, tokenA)).toBeDefined();
	tx.outputs[0]!.token_category = `\\x${txB}`;
	expect(decodeAuthChain(data, tokenA)).toBeUndefined();
});

test("transaction metadata is publication-specific across A → B → A and ignores category cache", async () => {
	const screen = mountPages("tx");
	await settle();
	screen.store.authchains.set(txB, registry(txB, "Wrong cached metadata"));
	const fetchMock = spyOn(globalThis, "fetch").mockImplementation(
		Object.assign(
			async (input: string | URL | Request) =>
				new Response(
					JSON.stringify(
						registry(
							txB,
							String(input).endsWith("/b") ? "Publication B" : "Publication A",
						),
					),
				),
			{ preconnect: fetch.preconnect },
		),
	);
	cleanup.push(() => fetchMock.mockRestore());
	for (const [script, name] of [
		["6a0442434d520161", "Publication A"],
		["6a0442434d520162", "Publication B"],
		["6a0442434d520161", "Publication A"],
	]) {
		request("GetTx", txB).observer.next?.({ data: txResponse(txB, script) });
		request("GetAuthChains", txB).observer.next?.({
			data: chainResponse(txB, script),
		});
		await settle();
		expect(screen.text()).toContain(name || "");
		expect(screen.text()).not.toContain("Wrong cached metadata");
		expect(screen.text()).not.toContain(
			name === "Publication A" ? "Publication B" : "Publication A",
		);
	}
});

test("missing revisions retain recovery controls and network rejection clears selected identity", async () => {
	const screen = mountPages();
	await settle();
	screen.store.authchains.set(tokenA, registry(tokenA, "Mainnet selected"));
	await answerToken(tokenA);
	expect(screen.text()).toContain("Mainnet selected");
	route.query = { revision: "missing-revision" };
	await settle();
	expect(screen.text()).toContain("Show the default chain");
	expect(screen.text()).not.toContain("Mainnet selected");
	route.query = {};
	await settle();
	expect(screen.text()).toContain("Mainnet selected");
	screen.state.network = "chipnet";
	await settle();
	request("GetAuthChains", tokenA, "chipnet").observer.error?.(
		new Error("chipnet offline"),
	);
	await settle();
	expect(screen.text()).not.toContain("Mainnet selected");
	expect(screen.text()).toContain("Retry auth chains");
	expect(screen.text()).toContain("0 available");
});
