import { afterAll, describe, expect, test } from "bun:test";
import { computed, effectScope, nextTick, ref, watch } from "vue";
import type { GetAuthChainsQuery } from "../src/graphql/graphql";
import {
	authChainFixture,
	category,
	documents,
	migration,
	publicationScript,
	registryDocument,
} from "./fixtures/authchains";

Object.assign(globalThis, { ref, computed, watch });
const { useAuthChainSelection } = await import(
	"../src/hooks/authChainSelection"
);
const { listAuthChains, loadAuthChainMetadata, selectAuthChain } = await import(
	"../src/module/authchains"
);
const { decodeAuthChain } = await import("../src/module/bcmr");

const delayed = Promise.withResolvers<Response>();
const slowRequested = Promise.withResolvers<void>();
const server = Bun.serve({
	port: 0,
	fetch(request) {
		const path = new URL(request.url).pathname;
		if (path === "/slow.json") {
			slowRequested.resolve();
			return delayed.promise;
		}
		if (path === "/invalid.json") return new Response("not JSON");
		if (path === "/bad-schema.json") return new Response("{}");
		const body = Object.entries(documents).find(
			([url]) => new URL(url).pathname === path,
		)?.[1];
		return body ? new Response(body) : new Response("missing", { status: 404 });
	},
});
afterAll(() => server.stop(true));

// Real HTTP responses and the real schema/hash validator, with publication URLs routed locally.
function localPublication(url: string, body: string) {
	return {
		status: "published" as const,
		url: `${server.url.origin}${new URL(url).pathname}`,
		contentHash: publicationScript(url, body).slice(16, 80),
		checkHash: true,
		opreturn: publicationScript(url, body),
	};
}

async function settleMetadata(
	metadata: ReturnType<typeof useAuthChainSelection>["metadata"],
) {
	if (metadata.value.status !== "loading") return;
	await new Promise<void>((resolve) =>
		watch(
			() => metadata.value.status,
			() => resolve(),
			{ once: true },
		),
	);
}

const chains = listAuthChains(authChainFixture, category);
const firstId = "4".repeat(64);
const secondId = "6".repeat(64);

describe("auth-chain and migration selection", () => {
	test("orders by migration index even when timestamps match and input is shuffled", () => {
		expect(chains[0]?.revisions.map(({ index }) => index)).toEqual([
			"3",
			"2",
			"1",
			"0",
		]);
		const reversed = structuredClone(authChainFixture);
		reversed.transaction[0]?.authchains.reverse().forEach((chain) => {
			chain.migrations.reverse();
		});
		expect(listAuthChains(reversed, category)).toEqual(chains);
		expect(selectAuthChain(chains).chain?.id).toBe(firstId);
	});

	test("selects metadata at the migration, retaining earlier publication only on that chain", () => {
		const old = selectAuthChain(chains, firstId, "2".repeat(64));
		expect(old.publicationRevision?.id).toBe("1".repeat(64));
		expect(selectAuthChain(chains).publicationRevision?.id).toBe(
			"3".repeat(64),
		);
		expect(selectAuthChain(chains, secondId).publicationRevision?.id).toBe(
			secondId,
		);
		expect(
			selectAuthChain(chains, secondId, "5".repeat(64)).publicationRevision,
		).toBeUndefined();
		expect(
			decodeAuthChain(authChainFixture, category, secondId)?.opreturn,
		).toContain(
			publicationScript(
				"https://fixtures.example/other.json",
				documents["https://fixtures.example/other.json"],
			).substring(2),
		);
		expect(selectAuthChain(chains, secondId).chain?.reservedSupply).toBe("80");
	});

	test("empty data and stale URLs do not silently choose a different chain or revision", () => {
		expect(listAuthChains({ transaction: [] }, category)).toEqual([]);
		expect(selectAuthChain([]).publicationRevision).toBeUndefined();
		expect(selectAuthChain(chains, "missing")).toMatchObject({
			missing: true,
			chain: undefined,
		});
		expect(selectAuthChain(chains, secondId, "1".repeat(64))).toMatchObject({
			missing: true,
			revision: undefined,
			publicationRevision: undefined,
		});
	});

	test("malformed latest publication does not fall back to valid earlier content", () => {
		const fixture = structuredClone(authChainFixture);
		fixture.transaction[0]?.authchains[0]?.migrations.push(
			migration("7", "4", "\\x6a0442434d5220"),
		);
		const selected = selectAuthChain(listAuthChains(fixture, category));
		expect(selected.publicationRevision?.publication.status).toBe("invalid");
		expect(decodeAuthChain(fixture, category)?.opreturn).toBe("");
	});

	test("genesis supply only counts the requested category", () => {
		const fixture = structuredClone(authChainFixture);
		fixture.transaction[0]?.authchains[0]?.migrations[0]?.transaction[0]?.outputs.push(
			{
				token_category: "\\xffff",
				locking_bytecode: "\\x51",
				fungible_token_amount: "9000",
				nonfungible_token_capability: null,
				nonfungible_token_commitment: null,
			},
		);
		expect(decodeAuthChain(fixture, category)?.genesesTx.genesisSupply).toBe(
			"1000",
		);
	});
});

describe("selected publication metadata", () => {
	test("chain and historical migration selections resolve different real metadata", async () => {
		for (const [chainId, revisionId, expected] of [
			[firstId, "2".repeat(64), "Original"],
			[firstId, undefined, "Updated"],
			[secondId, undefined, "Other chain"],
		] as const) {
			const publication = selectAuthChain(chains, chainId, revisionId)
				.publicationRevision?.publication;
			expect(publication?.status).toBe("published");
			if (publication?.status !== "published") continue;
			const metadata = await loadAuthChainMetadata(
				{
					...publication,
					url: `${server.url.origin}${new URL(publication.url).pathname}`,
				},
				category,
			);
			expect(metadata.status).toBe("ready");
			if (metadata.status === "ready") {
				expect(metadata.identity.name).toBe(expected);
				expect(metadata.hashStatus).toBe("match");
			}
		}
	});

	test("hash mismatch suppresses metadata instead of displaying corrupt content", async () => {
		const publication = localPublication(
			"https://fixtures.example/new.json",
			registryDocument("Tampered"),
		);
		const result = await loadAuthChainMetadata(publication, category);
		expect(result).toMatchObject({
			status: "unavailable",
			hashStatus: "mismatch",
		});
		expect("identity" in result).toBe(false);
	});

	test("absent publication, invalid publication, HTTP failure, and missing category are explicit", async () => {
		expect(
			(await loadAuthChainMetadata({ status: "none" }, category)).status,
		).toBe("unavailable");
		expect(
			(
				await loadAuthChainMetadata(
					{ status: "invalid", opreturn: "bad" },
					category,
				)
			).status,
		).toBe("unavailable");
		expect(
			await loadAuthChainMetadata(
				localPublication("https://fixtures.example/missing.json", ""),
				category,
			),
		).toMatchObject({
			status: "unavailable",
			message: "Metadata could not be loaded (HTTP 404).",
		});
		const result = await loadAuthChainMetadata(
			localPublication(
				"https://fixtures.example/new.json",
				documents["https://fixtures.example/new.json"],
			),
			"bb".repeat(32),
		);
		expect(result.status).toBe("unavailable");
		expect("identity" in result).toBe(false);
	});

	test("invalid JSON and invalid BCMR schema cannot become token metadata", async () => {
		for (const [path, body] of [
			["invalid.json", "not JSON"],
			["bad-schema.json", "{}"],
		] as const) {
			const result = await loadAuthChainMetadata(
				localPublication(`https://fixtures.example/${path}`, body),
				category,
			);
			expect(result.status).toBe("unavailable");
			expect("identity" in result).toBe(false);
		}
	});

	test("a slow previous request cannot overwrite the selected chain", async () => {
		const fixture = structuredClone(authChainFixture);
		const [first, second] = fixture.transaction[0]?.authchains || [];
		if (!first || !second) throw new Error("Expected two fixture chains");
		first.migrations = [
			migration(
				"4",
				"0",
				publicationScript(
					`${server.url.origin}/slow.json`,
					documents["https://fixtures.example/old.json"],
				),
			),
		];
		second.migrations = [
			migration(
				"6",
				"0",
				publicationScript(
					`${server.url.origin}/other.json`,
					documents["https://fixtures.example/other.json"],
				),
			),
		];
		const scope = effectScope();
		const chainId = ref<string>();
		const model = scope.run(() =>
			useAuthChainSelection(
				ref<GetAuthChainsQuery>(fixture),
				ref(category),
				chainId,
				ref(),
			),
		);
		if (!model) return;
		try {
			await slowRequested.promise;
			chainId.value = secondId;
			await nextTick();
			await settleMetadata(model.metadata);
			expect(
				model.metadata.value.status === "ready" &&
					model.metadata.value.identity.name,
			).toBe("Other chain");
			delayed.resolve(
				new Response(documents["https://fixtures.example/old.json"]),
			);
			await nextTick();
			expect(
				model.metadata.value.status === "ready" &&
					model.metadata.value.identity.name,
			).toBe("Other chain");
		} finally {
			scope.stop();
		}
	});

	test("CID publications are explicitly unverified rather than falsely hash-matched", async () => {
		const result = await loadAuthChainMetadata(
			{
				...localPublication("https://fixtures.example/new.json", ""),
				checkHash: false,
			},
			category,
		);
		expect(result).toMatchObject({
			status: "ready",
			hashStatus: "not-checked",
		});
	});

	test("reactive chain and migration changes clear stale metadata and settle on new content", async () => {
		const fixture = structuredClone(authChainFixture);
		for (const chain of fixture.transaction[0]?.authchains || []) {
			for (const migration of chain.migrations) {
				for (const tx of migration.transaction) {
					for (const output of tx.outputs) {
						for (const [url, body] of Object.entries(documents)) {
							if (output.locking_bytecode === publicationScript(url, body))
								output.locking_bytecode = publicationScript(
									`${server.url.origin}${new URL(url).pathname}`,
									body,
								);
						}
					}
				}
			}
		}
		const scope = effectScope();
		const chainId = ref<string>();
		const revisionId = ref<string>();
		const model = scope.run(() =>
			useAuthChainSelection(
				ref<GetAuthChainsQuery>(fixture),
				ref(category),
				chainId,
				revisionId,
			),
		);
		if (!model) return;
		try {
			await settleMetadata(model.metadata);
			expect(model.metadata.value.status).toBe("ready");
			revisionId.value = "1".repeat(64);
			await nextTick();
			expect(model.metadata.value.status).toBe("loading");
			await settleMetadata(model.metadata);
			expect(
				model.metadata.value.status === "ready" &&
					model.metadata.value.identity.name,
			).toBe("Original");
			chainId.value = secondId;
			revisionId.value = undefined;
			await nextTick();
			await settleMetadata(model.metadata);
			expect(
				model.metadata.value.status === "ready" &&
					model.metadata.value.identity.name,
			).toBe("Other chain");
		} finally {
			scope.stop();
		}
	});
});
