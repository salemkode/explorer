import { describe, expect, test } from "bun:test";
import {
	CHAINGRAPH_SERVER_STORAGE_KEY,
	networksOfNodes,
	PUBLIC_CHAINGRAPH_SERVERS,
	parseChaingraphUrl,
	probeChaingraph,
	readStoredChaingraphUrl,
	resolveChaingraphEndpoint,
	saveChaingraphUrl,
} from "../src/module/chaingraphServer";

const memoryStorage = () => {
	const items = new Map<string, string>();
	return {
		items,
		getItem: (key: string) => items.get(key) ?? null,
		setItem: (key: string, value: string) => void items.set(key, value),
		removeItem: (key: string) => void items.delete(key),
	};
};

const fallback = {
	httpUrl: "https://chaingraph.example.org/v1/graphql",
	wsUrl: "wss://chaingraph.example.org/v1/graphql",
};

describe("parseChaingraphUrl", () => {
	test("derives the subscription URL from the HTTP URL", () => {
		expect(
			parseChaingraphUrl("https://gql.chaingraph.pat.mn/v1/graphql"),
		).toEqual({
			httpUrl: "https://gql.chaingraph.pat.mn/v1/graphql",
			wsUrl: "wss://gql.chaingraph.pat.mn/v1/graphql",
		});
	});
	test("accepts a wss URL, a bare host and a trailing slash", () => {
		expect(parseChaingraphUrl("wss://example.org/v1/graphql/")?.httpUrl).toBe(
			"https://example.org/v1/graphql",
		);
		expect(parseChaingraphUrl(" example.org ")?.httpUrl).toBe(
			"https://example.org/v1/graphql",
		);
		expect(parseChaingraphUrl("https://example.org:8443")?.wsUrl).toBe(
			"wss://example.org:8443/v1/graphql",
		);
	});
	test("allows plain http only on localhost", () => {
		expect(parseChaingraphUrl("http://localhost:8080/v1/graphql")).toEqual({
			httpUrl: "http://localhost:8080/v1/graphql",
			wsUrl: "ws://localhost:8080/v1/graphql",
		});
		expect(parseChaingraphUrl("http://example.org/v1/graphql")).toBeUndefined();
	});
	test("rejects other schemes, credentials and garbage", () => {
		expect(parseChaingraphUrl("")).toBeUndefined();
		expect(parseChaingraphUrl("javascript:alert(1)")).toBeUndefined();
		expect(parseChaingraphUrl("ftp://example.org")).toBeUndefined();
		expect(parseChaingraphUrl("https://user:pass@example.org")).toBeUndefined();
		expect(parseChaingraphUrl("https://exa mple.org")).toBeUndefined();
	});
	test("every listed public server parses to itself", () => {
		for (const server of PUBLIC_CHAINGRAPH_SERVERS)
			expect(parseChaingraphUrl(server.httpUrl)).toEqual({
				httpUrl: server.httpUrl,
				wsUrl: server.wsUrl,
			});
	});
});

describe("stored server choice", () => {
	test("round-trips through storage as useStorage's JSON string", () => {
		const storage = memoryStorage();
		saveChaingraphUrl("https://example.org/v1/graphql", storage);
		expect(storage.items.get(CHAINGRAPH_SERVER_STORAGE_KEY)).toBe(
			'"https://example.org/v1/graphql"',
		);
		expect(readStoredChaingraphUrl(storage)).toBe(
			"https://example.org/v1/graphql",
		);
		saveChaingraphUrl("", storage);
		expect(storage.items.has(CHAINGRAPH_SERVER_STORAGE_KEY)).toBe(false);
		expect(readStoredChaingraphUrl(storage)).toBe("");
	});
	test("tolerates missing or broken storage", () => {
		expect(readStoredChaingraphUrl(undefined)).toBe("");
		expect(
			readStoredChaingraphUrl({
				getItem: () => {
					throw new Error("denied");
				},
			}),
		).toBe("");
	});
	test("a valid choice overrides the default, anything else falls back", () => {
		expect(
			resolveChaingraphEndpoint(
				"https://gql.chaingraph.pat.mn/v1/graphql",
				fallback,
			),
		).toEqual({
			httpUrl: "https://gql.chaingraph.pat.mn/v1/graphql",
			wsUrl: "wss://gql.chaingraph.pat.mn/v1/graphql",
			custom: true,
		});
		expect(resolveChaingraphEndpoint("", fallback)).toEqual({
			...fallback,
			custom: false,
		});
		expect(
			resolveChaingraphEndpoint("http://evil.example", fallback).custom,
		).toBe(false);
		expect(resolveChaingraphEndpoint(fallback.httpUrl, fallback).custom).toBe(
			false,
		);
	});
	test("a saved choice of a retired server is ignored", () => {
		expect(
			parseChaingraphUrl("https://chaingraph.paryonusd.com/v1/graphql"),
		).toBeUndefined();
		expect(
			resolveChaingraphEndpoint(
				"https://chaingraph.paryonusd.com/v1/graphql",
				fallback,
			),
		).toEqual({ ...fallback, custom: false });
	});
});

describe("probeChaingraph", () => {
	const respond =
		(body: unknown, status = 200) =>
		async () =>
			new Response(JSON.stringify(body), { status });
	let clock = 0;
	const now = () => (clock += 120);

	test("reports the networks the explorer can use", async () => {
		expect(networksOfNodes(["bchn-mainnet", "bchn-chipnet"])).toEqual([
			"mainnet",
			"chipnet",
		]);
		expect(networksOfNodes(["graph-mainnet"])).toEqual(["mainnet"]);
		const probe = await probeChaingraph("https://x/v1/graphql", {
			fetch: respond({
				data: { node: [{ name: "graph-mainnet" }] },
			}),
			now,
		});
		expect(probe).toEqual({
			status: "online",
			nodes: ["graph-mainnet"],
			networks: ["mainnet"],
			latencyMs: 120,
		});
	});
	test("HTTP errors, GraphQL errors and network failures are offline", async () => {
		expect(
			await probeChaingraph("https://x", {
				fetch: respond("error code: 520", 520),
			}),
		).toEqual({ status: "offline", message: "HTTP 520" });
		expect(
			await probeChaingraph("https://x", {
				fetch: respond({
					errors: [{ message: "field 'node' not found" }],
				}),
			}),
		).toEqual({ status: "offline", message: "field 'node' not found" });
		expect(
			await probeChaingraph("https://x", {
				fetch: async () => {
					throw new TypeError("Failed to fetch");
				},
			}),
		).toEqual({ status: "offline", message: "Unreachable" });
	});
});
