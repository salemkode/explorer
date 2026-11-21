import { beforeEach, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { cashAddressToLockingBytecode } from "@bitauth/libauth";
import { compileScript, parse } from "@vue/compiler-sfc";
import { renderToString } from "@vue/server-renderer";
import { plugin } from "bun";
import { createPinia, setActivePinia } from "pinia";
import {
	computed,
	createSSRApp,
	defineComponent,
	h,
	onBeforeUnmount,
	onMounted,
	reactive,
	ref,
	shallowReactive,
	shallowRef,
	useId,
	watch,
} from "vue";

mock.module("../../src/hooks/authchains", () => ({
	useAuthChains: () => undefined,
}));

// Compile the actual Vue components, rather than duplicating their mapping logic.
plugin({
	name: "vue-address-regressions",
	setup(build) {
		build.onLoad({ filter: /\.vue$/ }, ({ path }) => {
			const { descriptor } = parse(readFileSync(path, "utf8"), {
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
Object.assign(globalThis, {
	computed,
	ref,
	reactive,
	shallowReactive,
	shallowRef,
	watch,
	onMounted,
	onBeforeUnmount,
	useId,
	gql: (source: string) => source,
	useSubscription: () => ({ result: ref() }),
	useQuery: () => ({ onResult: () => undefined }),
	useFetch: () => ({ data: ref() }),
});
const { addressDisplayMode } = await import("../../src/hooks/addressDisplay");
const { default: TransactionList } = await import(
	"../../src/components/Transaction/TransactionList.vue"
);
const { default: TransactionListOperation } = await import(
	"../../src/components/Transaction/TransactionListOperation.vue"
);
const { default: AddressHeader } = await import(
	"../../src/components/address/AddressHeader.vue"
);
const { default: AddressFormatSettings } = await import(
	"../../src/components/AddressFormatSettings.vue"
);

const locking_bytecode = `\\x76a914${"12".repeat(20)}88ac`;
const category = `\\x${"34".repeat(32)}` as const;
const bch = { locking_bytecode, value_satoshis: "1000", token_category: null };
const nft = {
	...bch,
	token_category: category,
	fungible_token_amount: "0",
	nonfungible_token_capability: "none" as const,
	nonfungible_token_commitment: "\\x" as const,
};

beforeEach(() => {
	setActivePinia(createPinia());
	addressDisplayMode.value = "auto";
});

for (const mode of ["auto", "token", "regular"] as const) {
	for (const direction of ["spend NFT", "receive FT"] as const) {
		test(`actual transaction copy, link and destination QR stay consistent: ${mode}, ${direction}`, async () => {
			addressDisplayMode.value = mode;
			const copies: { text: string; url?: string; copy: boolean }[] = [];
			const qrPayloads: string[] = [];
			const app = createSSRApp(TransactionList, {
				transactions: [
					{
						hash: `\\x${"56".repeat(32)}`,
						is_coinbase: false,
						// Same script, different token data on the spent and created output.
						inputs: [{ outpoint: direction === "spend NFT" ? nft : bch }],
						outputs: [
							direction === "spend NFT"
								? bch
								: { ...nft, fungible_token_amount: "100" },
							{ locking_bytecode: "\\x6a0161", value_satoshis: "0" },
						],
					},
				],
			});
			app.config.globalProperties.$t = (key: string) => key;
			app.component("TransactionListOperation", TransactionListOperation);
			app.component(
				"SliderUpDown",
				defineComponent({
					props: { active: Boolean },
					setup:
						(_, { slots }) =>
						() =>
							slots.default?.(),
				}),
			);
			app.component(
				"TransactionOperationToken",
				defineComponent({ setup: () => () => null }),
			);
			const Copy = defineComponent({
				props: {
					text: { type: String, default: "" },
					url: String,
					copy: Boolean,
				},
				setup(props) {
					copies.push({ text: props.text, url: props.url, copy: props.copy });
					return () => h("span", props.text);
				},
			});
			app.component("BaseCopy", Copy);
			await renderToString(app);
			const addresses = copies.filter(({ url }) =>
				url?.startsWith("/address/"),
			);
			expect(addresses).toHaveLength(4); // two summaries and two expanded rows
			const inputSupport =
				mode === "token" || (mode === "auto" && direction === "spend NFT");
			const outputSupport =
				mode === "token" || (mode === "auto" && direction === "receive FT");
			const expectedSupport = [
				inputSupport,
				outputSupport,
				inputSupport,
				outputSupport,
			];
			for (const [index, copy] of addresses.entries()) {
				expect(copy.url).toBe(`/address/${copy.text}`);
				const destination = createSSRApp(AddressHeader, { address: copy.text });
				destination.component("BaseCopy", Copy);
				destination.component(
					"VueQrCode",
					defineComponent({
						props: { content: { type: String, required: true } },
						setup(props) {
							qrPayloads.push(props.content);
							return () => null;
						},
					}),
				);
				const firstPayload = qrPayloads.length;
				await renderToString(destination);
				// The header renders the QR inline and again in its enlarge dialog.
				const payloads = qrPayloads.slice(firstPayload);
				expect(payloads.length).toBeGreaterThan(0);
				for (const payload of payloads) {
					const decoded = cashAddressToLockingBytecode(payload);
					if (typeof decoded === "string") throw new Error(decoded);
					expect(decoded.tokenSupport).toBe(expectedSupport[index] === true);
				}
				expect(copies.at(-1)?.text).toBe(copy.text);
			}
			expect(addresses.slice(2).every(({ copy }) => copy)).toBe(true);
		});
	}
}

test("settings render three native radio choices with the effective preference selected", async () => {
	for (const mode of ["auto", "token", "regular"] as const) {
		addressDisplayMode.value = mode;
		const html = await renderToString(createSSRApp(AddressFormatSettings));
		expect(html.match(/type="radio"/g)).toHaveLength(3);
		expect(html.match(/ checked/g)).toHaveLength(1);
		expect(html.match(/<input[^>]+checked>/)?.[0]).toContain(`value="${mode}"`);
	}
});
