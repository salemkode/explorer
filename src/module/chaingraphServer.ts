/**
 * Chaingraph server selection. The explorer reads all chain data from one
 * Chaingraph (Hasura) GraphQL endpoint. The deployment sets a default at build
 * time (CHAINGRAPH_HTTP / CHAINGRAPH_WS); a visitor can choose another server
 * in Settings, stored in this browser and applied when the app starts.
 */

export interface ChaingraphEndpoint {
	httpUrl: string;
	wsUrl: string;
}

export interface ChaingraphServer extends ChaingraphEndpoint {
	name: string;
	operator: string;
}

/** Known public Chaingraph servers. Their availability is checked live in Settings. */
export const PUBLIC_CHAINGRAPH_SERVERS: ChaingraphServer[] = [
	{
		name: "ParyonUSD",
		operator: "chaingraph.paryonusd.com",
		httpUrl: "https://chaingraph.paryonusd.com/v1/graphql",
		wsUrl: "wss://chaingraph.paryonusd.com/v1/graphql",
	},
	{
		name: "pat.mn",
		operator: "gql.chaingraph.pat.mn",
		httpUrl: "https://gql.chaingraph.pat.mn/v1/graphql",
		wsUrl: "wss://gql.chaingraph.pat.mn/v1/graphql",
	},
	{
		name: "Chaingraph demo",
		operator: "demo.chaingraph.cash",
		httpUrl: "https://demo.chaingraph.cash/v1/graphql",
		wsUrl: "wss://demo.chaingraph.cash/v1/graphql",
	},
];

/** localStorage key of the selected server's HTTP URL ("" = deployment default). */
export const CHAINGRAPH_SERVER_STORAGE_KEY = "chaingraphServer";

export const EXPLORER_NETWORKS = ["mainnet", "chipnet"] as const;
export type ExplorerNetwork = (typeof EXPLORER_NETWORKS)[number];

/**
 * Parses a user-entered server address into HTTP and WebSocket endpoints.
 * Accepts http(s) or ws(s) URLs; a bare origin gets Hasura's `/v1/graphql`
 * path. Returns undefined for anything else. Plain http/ws is only allowed for
 * localhost, since browsers block mixed content on the HTTPS site.
 */
export const parseChaingraphUrl = (
	input: string,
): ChaingraphEndpoint | undefined => {
	const trimmed = input.trim();
	if (!trimmed) return undefined;
	let url: URL;
	try {
		url = new URL(
			/^[a-z]+:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
		);
	} catch {
		return undefined;
	}
	const secure = url.protocol === "https:" || url.protocol === "wss:";
	const insecure = url.protocol === "http:" || url.protocol === "ws:";
	if (!secure && !insecure) return undefined;
	const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
	if (insecure && !local) return undefined;
	if (url.username || url.password) return undefined;
	const path =
		url.pathname === "/" || url.pathname === ""
			? "/v1/graphql"
			: url.pathname.replace(/\/+$/, "");
	const rest = `//${url.host}${path}${url.search}`;
	return {
		httpUrl: `${secure ? "https:" : "http:"}${rest}`,
		wsUrl: `${secure ? "wss:" : "ws:"}${rest}`,
	};
};

/** The stored server choice, read the way `useStorage` writes it (JSON string). */
export const readStoredChaingraphUrl = (
	storage: Pick<Storage, "getItem"> | undefined = globalThis.localStorage,
): string => {
	try {
		const raw = storage?.getItem(CHAINGRAPH_SERVER_STORAGE_KEY);
		if (!raw) return "";
		try {
			const parsed: unknown = JSON.parse(raw);
			return typeof parsed === "string" ? parsed : "";
		} catch {
			return raw;
		}
	} catch {
		return "";
	}
};

/** Stores the server choice ("" = deployment default) synchronously, ready for a reload. */
export const saveChaingraphUrl = (
	httpUrl: string,
	storage:
		| Pick<Storage, "setItem" | "removeItem">
		| undefined = globalThis.localStorage,
) => {
	if (!httpUrl) storage?.removeItem(CHAINGRAPH_SERVER_STORAGE_KEY);
	else storage?.setItem(CHAINGRAPH_SERVER_STORAGE_KEY, JSON.stringify(httpUrl));
};

/** The endpoint to use: the stored choice when valid, else the deployment default. */
export const resolveChaingraphEndpoint = (
	stored: string,
	fallback: ChaingraphEndpoint,
): ChaingraphEndpoint & { custom: boolean } => {
	const selected = parseChaingraphUrl(stored);
	return selected && selected.httpUrl !== fallback.httpUrl
		? { ...selected, custom: true }
		: { ...fallback, custom: false };
};

/** Explorer networks a server's nodes serve, matched like the explorer's queries (`_regex`). */
export const networksOfNodes = (nodeNames: string[]): ExplorerNetwork[] =>
	EXPLORER_NETWORKS.filter((network) =>
		nodeNames.some((name) => name.includes(network)),
	);

export type ChaingraphProbe =
	| {
			status: "online";
			networks: ExplorerNetwork[];
			nodes: string[];
			latencyMs: number;
	  }
	| { status: "offline"; message: string };

/** A server check as shown in Settings. */
export type ProbeState = ChaingraphProbe | { status: "checking" };

/** Checks that `httpUrl` answers as a Chaingraph server and which networks it indexes. */
export const probeChaingraph = async (
	httpUrl: string,
	{
		fetch: fetchImpl = globalThis.fetch,
		timeoutMs = 10_000,
		now = () => performance.now(),
	}: {
		fetch?: typeof fetch;
		timeoutMs?: number;
		now?: () => number;
	} = {},
): Promise<ChaingraphProbe> => {
	const started = now();
	try {
		const response = await fetchImpl(httpUrl, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ query: "{ node { name } }" }),
			signal: AbortSignal.timeout(timeoutMs),
		});
		if (!response.ok)
			return { status: "offline", message: `HTTP ${response.status}` };
		const body = (await response.json()) as {
			data?: { node?: { name?: unknown }[] };
			errors?: { message?: string }[];
		};
		const nodes = body.data?.node
			?.map(({ name }) => name)
			.filter((name): name is string => typeof name === "string");
		if (!nodes)
			return {
				status: "offline",
				message: body.errors?.[0]?.message ?? "Not a Chaingraph server",
			};
		return {
			status: "online",
			nodes,
			networks: networksOfNodes(nodes),
			latencyMs: Math.round(now() - started),
		};
	} catch (error) {
		const timedOut =
			error instanceof DOMException && error.name === "TimeoutError";
		return {
			status: "offline",
			message: timedOut ? "No response" : "Unreachable",
		};
	}
};
