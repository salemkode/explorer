import { describe, expect, test } from "bun:test";
import { compileScript, parse } from "@vue/compiler-sfc";
import { renderToString } from "@vue/server-renderer";
import { plugin } from "bun";
import { createPinia } from "pinia";
import {
	computed,
	createSSRApp,
	defineComponent,
	h,
	onMounted,
	ref,
	shallowReactive,
	shallowRef,
	watch,
} from "vue";
import type { Capability } from "~/types";

// Exercise the real SFCs without adding a second Vue test runner or DOM library.
plugin({
	name: "token-badge-vue-sfc",
	setup(build) {
		build.onLoad({ filter: /\.vue$/ }, async ({ path }) => {
			const { descriptor } = parse(await Bun.file(path).text(), {
				filename: path,
			});
			const script = compileScript(descriptor, {
				id: path,
				inlineTemplate: true,
			});
			return { contents: script.content, loader: "ts" };
		});
	},
});

// Nuxt supplies these auto-imports in production.
Object.assign(globalThis, {
	computed,
	onMounted,
	ref,
	shallowReactive,
	shallowRef,
	watch,
	gql: (source: string) => source,
	useSubscription: () => ({ result: ref() }),
});
const { useRegistryStore } = await import("../../src/store/registry");
const { default: TransactionOperationToken } = await import(
	"../../src/components/Transaction/TransactionOperationToken.vue"
);
const { default: TokenBadgeValue } = await import(
	"../../src/components/Transaction/TokenBadgeValue.vue"
);
const { default: BaseCopy } = await import("../../src/components/BaseCopy.vue");

async function inspectBadges(
	tokenAmount: string | null | undefined,
	tokenCommitment: string | null,
	decimals?: number,
	tokenCapability: Capability = "none",
) {
	const category = "ab".repeat(32);
	const app = createSSRApp({
		setup() {
			const registry = useRegistryStore();
			if (decimals !== undefined) {
				registry.registryList.push({
					name: "Test registry",
					url: "auth_chain",
					enable: true,
					default: false,
				});
				registry.authchains.set(category, {
					version: { major: 2, minor: 0, patch: 0 },
					latestRevision: "2024-01-01T00:00:00.000Z",
					registryIdentity: "Test registry",
					identities: {
						[category]: {
							"2024-01-01T00:00:00.000Z": {
								name: "Test token",
								token: { category, decimals, symbol: "TEST" },
							},
						},
					},
				});
			}
			return () =>
				h(TransactionOperationToken, {
					category,
					tokenAmount,
					tokenCommitment,
					tokenCapability,
				});
		},
	});
	app.use(createPinia());
	app.component("TransactionTokenBadgeValue", TokenBadgeValue);
	app.component("BaseCopy", BaseCopy);
	app.component(
		"NuxtLink",
		defineComponent({
			props: { to: String },
			setup(props, { slots }) {
				return () => h("a", { href: props.to }, slots.default?.());
			},
		}),
	);

	const inspection = {
		summaries: new Map<string, string | null>(),
		copyButtons: 0,
		disclosures: 0,
		text: "",
	};
	await new HTMLRewriter()
		.on("summary", {
			element(element) {
				inspection.summaries.set(
					element.getAttribute("title") || "",
					element.getAttribute("aria-label"),
				);
			},
		})
		.on("button[aria-label='Copy to clipboard']", {
			element() {
				inspection.copyButtons++;
			},
		})
		.on("details", {
			element() {
				inspection.disclosures++;
			},
		})
		.on("div", {
			text(chunk) {
				inspection.text += chunk.text;
			},
		})
		.transform(new Response(await renderToString(app)))
		.text();
	return inspection;
}

describe("transaction badges rendered with the registry and BaseCopy", () => {
	test.each([
		"1",
		"9007199254740993",
		"72624976668144285",
		"9223372036854775807",
	])(
		"preserves issue #26's exact raw amount %s when compact display is enabled",
		async (raw) => {
			const result = await inspectBadges(raw, null);
			expect(result.summaries.has(raw)).toBe(true);
			expect(result.text).toContain(raw);
			expect(result.copyButtons).toBe(1);
		},
	);

	test.each([undefined, null])(
		"missing amount %s stays absent",
		async (raw) => {
			const result = await inspectBadges(raw, null);
			expect(result.disclosures).toBe(0);
			expect(result.copyButtons).toBe(0);
		},
	);

	test.each(["none", "mutable", "minting"] as const)(
		"NFT %s retains its commitment and capability without an FT amount",
		async (capability) => {
			const result = await inspectBadges(
				undefined,
				"00ff",
				undefined,
				capability,
			);
			expect(result.summaries.has("00ff")).toBe(true);
			expect(result.copyButtons).toBe(1);
			if (capability !== "none")
				expect(result.text).toContain(`${capability} nft`);
		},
	);

	test("combined FT and NFT outputs preserve the maximum amount and commitment", async () => {
		const result = await inspectBadges(
			"9223372036854775807",
			"00ff",
			undefined,
			"mutable",
		);
		expect(result.summaries.has("9223372036854775807")).toBe(true);
		expect(result.summaries.has("00ff")).toBe(true);
		expect(result.copyButtons).toBe(2);
	});

	test("keeps compact summaries separate from exact decimal and base-unit copy values", async () => {
		const commitment = `0000000${"ab".repeat(20)}92461b87`;
		const result = await inspectBadges("9007199254740993", commitment, 2);
		expect(result.disclosures).toBe(2);
		expect(result.summaries.get("90071992547409.93")).toBe(
			"Exact token amount: 90071992547409.93. Inspect exact value",
		);
		expect(result.summaries.get(commitment)).toBe(
			`Exact NFT commitment: ${commitment}. Inspect exact value`,
		);
		expect(result.text).toContain("≈90.1t");
		expect(result.text).toContain("TEST");
		expect(result.text).toContain("90071992547409.93");
		expect(result.text).toContain("9007199254740993");
		expect(result.text).toContain("0000000......92461b87");
		expect(result.text).toContain(commitment);
		expect(result.copyButtons).toBe(3);
	});

	test("scales with actual registry metadata before selecting a compact suffix", async () => {
		const result = await inspectBadges("200000", null, 2);
		expect(result.text).toContain("2k");
		expect(result.summaries.has("2000")).toBe(true);
		expect(result.copyButtons).toBe(2);
	});

	test("identifies base units when metadata is unavailable", async () => {
		const result = await inspectBadges("2000", null);
		expect(result.text).toContain("2k");
		expect(result.summaries.get("2000")).toContain("metadata unavailable");
		expect(result.copyButtons).toBe(1);
	});

	test("preserves an explicit zero and short leading-zero commitment", async () => {
		const result = await inspectBadges("0", "0001", 0);
		expect(result.summaries.has("0")).toBe(true);
		expect(result.summaries.has("0001")).toBe(true);
		expect(result.copyButtons).toBe(2);
	});

	test("omits absent values and does not invent a commitment", async () => {
		const result = await inspectBadges(null, "");
		expect(result.disclosures).toBe(0);
		expect(result.copyButtons).toBe(0);
	});

	test("shows invalid amounts as unavailable instead of zero", async () => {
		const result = await inspectBadges("not-an-integer", null, 0);
		expect(result.text).toContain("Amount unavailable");
		expect(result.disclosures).toBe(0);
		expect(result.copyButtons).toBe(0);
	});
});
