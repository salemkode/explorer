import { describe, expect, test } from "bun:test";
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
	watch,
} from "vue";
import { compileScript, parse } from "vue/compiler-sfc";
import { renderToString } from "vue/server-renderer";

// Compile the real badge, including its template, without a browser or new deps.
plugin({
	name: "transaction-token-vue",
	setup(build) {
		build.onLoad(
			{ filter: /TransactionOperationToken\.vue$/ },
			async ({ path }) => {
				const { descriptor } = parse(await Bun.file(path).text(), {
					filename: path,
				});
				const script = compileScript(descriptor, {
					id: path,
					inlineTemplate: true,
				});
				return { contents: script.content, loader: "ts" };
			},
		);
	},
});

// Nuxt supplies these auto-imports in the app; retain real Vue/Pinia behavior.
Object.assign(globalThis, {
	computed,
	onMounted,
	ref,
	shallowReactive,
	watch,
	gql: (source: string) => source,
});

const { default: TransactionOperationToken } = await import(
	"../src/components/Transaction/TransactionOperationToken.vue"
);
const { useRegistryStore } = await import("../src/store/registry");

const category = "0123456789abcdef".repeat(4);
const categoryLabel = "01234567...bcdef";
const NuxtLink = defineComponent({
	props: { to: String },
	setup(props, { slots }) {
		return () => h("a", { href: props.to }, slots.default?.());
	},
});

async function renderBadge(
	props: Partial<InstanceType<typeof TransactionOperationToken>["$props"]> = {},
	decimals?: number,
) {
	const app = createSSRApp({
		setup() {
			if (decimals !== undefined) {
				const store = useRegistryStore();
				store.registryList.push({
					name: "Test registry",
					url: "auth_chain",
					enable: true,
					default: false,
				});
				store.authchains.set(category, {
					version: { major: 2, minor: 0, patch: 0 },
					latestRevision: "2024-01-01T00:00:00.000Z",
					registryIdentity: "Test registry",
					identities: {
						[category]: {
							"2024-01-01T00:00:00.000Z": {
								name: "Test token",
								token: { category, symbol: "TEST", decimals },
							},
						},
					},
				});
			}
			return () =>
				h(TransactionOperationToken, {
					category,
					tokenAmount: undefined,
					tokenCapability: undefined,
					tokenCommitment: undefined,
					...props,
				});
		},
	})
		.use(createPinia())
		.component("NuxtLink", NuxtLink);

	return (await renderToString(app))
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

describe("transaction token badge", () => {
	test.each([
		"1",
		"9007199254740993",
		"72624976668144285",
		"9223372036854775807",
	])("renders the exact raw amount %s", async (tokenAmount) => {
		expect(await renderBadge({ tokenAmount })).toBe(
			`${categoryLabel} • ${tokenAmount}`,
		);
	});

	test("registry decimals do not change transaction raw-unit semantics", async () => {
		expect(await renderBadge({ tokenAmount: "72624976668144285" }, 8)).toBe(
			`${categoryLabel} • 72624976668144285 TEST`,
		);
	});

	test("zero retains the category without an NFT's fungible amount label", async () => {
		expect(await renderBadge({ tokenAmount: "0" })).toBe(`${categoryLabel} •`);
	});

	test.each([undefined, null])(
		"missing amount %s stays absent",
		async (tokenAmount) => {
			expect(await renderBadge({ tokenAmount })).toBe("");
		},
	);

	test.each(["none", "mutable", "minting"] as const)(
		"NFT %s commitment and capability survive without a fungible amount",
		async (tokenCapability) => {
			expect(
				await renderBadge({ tokenCapability, tokenCommitment: "00ff" }),
			).toBe(
				`NFT: 00ff${tokenCapability === "none" ? "" : ` ${tokenCapability} nft`}`,
			);
		},
	);

	test("combined fungible and NFT output keeps the full amount and commitment", async () => {
		expect(
			await renderBadge({
				tokenAmount: "9223372036854775807",
				tokenCapability: "mutable",
				tokenCommitment: "00ff",
			}),
		).toBe(`${categoryLabel} • 9223372036854775807 NFT: 00ff mutable nft`);
	});
});
