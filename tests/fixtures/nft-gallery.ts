import { afterEach, describe, expect, mock, test } from "bun:test";
import {
	computed,
	defineComponent,
	effectScope,
	h,
	nextTick,
	reactive,
	ref,
	toRef,
	watchEffect,
} from "vue";
import { nftPage, useNftPagination } from "../../src/hooks/nftPagination";
import type { IdentitySnapshot } from "../../src/types";
import { dispatch, mountFixture, nodes, text } from "../vue-fixture";

const network = reactive({ network: "mainnet" });
const metadata = reactive({ loading: false, available: false });
mock.module("../../src/store/index.ts", () => ({
	useStateStore: () => network,
	useRegistryStore: () => ({
		getToken: () =>
			metadata.available
				? {
						loading: false,
						token: {
							name: "Fixture NFT",
							icon: "https://example.com/icon.png",
							image: "https://example.com/full.png",
						},
					}
				: { loading: metadata.loading },
	}),
}));
mock.module("../../src/module/utils.ts", () => ({
	getHttpsUrl: (url: string) => url,
	svgToBase64: (svg: string) => `data:image/svg+xml;base64,${btoa(svg)}`,
}));

mock.module("../../src/hooks/addressDisplay.ts", () => ({
	formatLockingBytecodeAddress: (
		_bytecode: string,
		context?: { tokenCategory?: string },
	) => (context?.tokenCategory ? "zowner" : "qowner"),
}));
mock.module("../../src/hooks/authchains.ts", () => ({
	useAuthChains: () => undefined,
}));
const fixtureOutputs = Array.from({ length: 25 }, (_, index) => ({
	transaction_hash: `\\x${"01".repeat(32)}`,
	output_index: String(index),
	token_category: `\\x${"ab".repeat(32)}`,
	nonfungible_token_commitment: "\\x00ff",
	nonfungible_token_capability: "none",
	locking_bytecode: "\\x76a914fixture88ac",
}));
const query = {
	result: ref({ output: fixtureOutputs, search_output: fixtureOutputs }),
	loading: ref(false),
	error: ref<Error>(),
	refetch: mock(),
};
const queryVariables = ref({ offset: 0, limit: 0 });
Object.assign(globalThis, {
	computed,
	ref,
	toRef,
	gql: (source: string) => source,
	useQuery: (
		_document: unknown,
		variables: { value: { offset: number; limit: number } },
	) => {
		watchEffect(() => {
			queryVariables.value = variables.value;
		});
		return query;
	},
});

const { default: NFTGallery } = await import(
	"../../src/components/token/NFTGallery.vue"
);
const { default: NFTImage } = await import(
	"../../src/components/token/NFTImage.vue"
);
const { default: BasePagination } = await import(
	"../../src/components/BasePagination.vue"
);
const { default: TokenChild } = await import(
	"../../src/components/token/Child.vue"
);
const { default: AddressNFTs } = await import(
	"../../src/components/address/AddressNFTs.vue"
);
const CopyFixture = defineComponent({
	props: { text: String, url: String },
	setup: (props) => () => h("a", { href: props.url }, props.text),
});
const cleanup = new Set<() => void>();
afterEach(() => {
	for (const unmount of cleanup) unmount();
	cleanup.clear();
	metadata.loading = false;
	metadata.available = false;
});

function mountGallery(items = [nft("01", "0"), nft("01", "1")]) {
	const events = { next: mock(), previous: mock(), retry: mock() };
	const props = reactive({
		identitySnapshot: undefined as IdentitySnapshot | null | undefined,
		items,
		loading: false,
		error: "",
		hasPrevPage: false,
		hasNextPage: true,
		onNext: events.next,
		onPrevious: events.previous,
		onRetry: events.retry,
	});
	const mounted = mountFixture(NFTGallery, props, {
		BasePagination,
		LoadingSpinner: { render: () => h("span", "spinner") },
		BaseCopy: CopyFixture,
	});
	cleanup.add(mounted.unmount);
	return { ...mounted, props, events };
}

function nft(hash: string, index: string) {
	return {
		id: `${hash.repeat(32)}:${index}`,
		category: "ab".repeat(32),
		commitment: "00ff",
		capability: "none" as const,
		address: "qowner",
	};
}

describe("NFT gallery fixtures", () => {
	test("identical commitments retain separate card and image state during a page update", async () => {
		metadata.available = true;
		const { root, props } = mountGallery();
		const articles = nodes(root, "article");
		expect(articles).toHaveLength(2);
		props.items = [nft("01", "1"), nft("02", "0")];
		await nextTick();
		expect(nodes(root, "article")[0]).toBe(articles[1]);
		expect(nodes(root, "article")[1]).not.toBe(articles[0]);
		expect(nodes(root, "a").map((link) => link.props.href)).toContain(
			`/token/${"ab".repeat(32)}`,
		);
		expect(nodes(root, "a").map((link) => link.props.href)).toContain(
			"/address/qowner",
		);
		expect(text(root)).toContain("00ff");
		expect(text(root)).toContain("none");
	});

	test("metadata unavailable and empty commitments do not hide NFTs", async () => {
		const { root, props } = mountGallery([
			{ ...nft("01", "0"), commitment: "" },
		]);
		expect(text(root)).toContain("Unnamed NFT");
		expect(text(root)).toContain("Metadata unavailable");
		expect(text(root)).toContain("Empty commitment");
		metadata.loading = true;
		await nextTick();
		expect(text(root)).toContain("Loading metadata…");
		expect(nodes(root, "article")).toHaveLength(1);
		props.items = [];
		await nextTick();
		expect(text(root)).toContain("No NFTs found on this page.");
	});

	test("loading hides stale cards and blocks page actions; errors offer retry and previous", async () => {
		const { root, props, events } = mountGallery();
		props.loading = true;
		await nextTick();
		expect(nodes(root, "article")).toHaveLength(0);
		expect(text(root)).toContain("Loading NFTs…");
		expect(
			nodes(root, "button").find(
				(node) => node.props["aria-label"] === "Next page",
			)?.props.disabled,
		).toBe(true);
		props.loading = false;
		props.error = "Indexer offline";
		props.hasPrevPage = true;
		await nextTick();
		expect(text(root)).toContain("Indexer offline");
		dispatch(
			nodes(root, "button").find((node) => node.text === "Try again"),
			"onClick",
		);
		expect(events.retry).toHaveBeenCalledTimes(1);
		dispatch(
			nodes(root, "button").find(
				(node) => node.props["aria-label"] === "Previous page",
			),
			"onClick",
		);
		expect(events.previous).toHaveBeenCalledTimes(1);
	});
	test("explicit missing selected metadata never falls back to an unrelated registry", async () => {
		metadata.available = true;
		const { root, props } = mountGallery();
		expect(text(root)).toContain("Fixture NFT");
		props.identitySnapshot = {
			name: "Selected revision",
			uris: { image: "https://example.com/selected.png" },
		};
		await nextTick();
		expect(text(root)).toContain("Selected revision");
		props.identitySnapshot = null;
		await nextTick();
		expect(text(root)).toContain("Metadata unavailable");
		expect(text(root)).not.toContain("Fixture NFT");
		expect(text(root)).not.toContain("Selected revision");
		expect(nodes(root, "img")[0]?.props.src).toStartWith(
			"data:image/svg+xml;base64,",
		);
		props.identitySnapshot = undefined;
		await nextTick();
		expect(text(root)).toContain("Fixture NFT");
	});
});

describe("NFT image behavior", () => {
	function mountImage() {
		const props = reactive({
			category: "ab".repeat(32),
			name: "Fixture NFT",
			image: "https://example.com/full.png",
			icon: "https://example.com/icon.png",
		});
		const mounted = mountFixture(NFTImage, props);
		cleanup.add(mounted.unmount);
		return { ...mounted, props };
	}

	test("full artwork opens after load and closes by button or Escape", async () => {
		const { root } = mountImage();
		const trigger = nodes(root, "button")[0];
		expect(trigger?.props.disabled).toBe(true);
		dispatch(nodes(root, "img")[0], "onLoad");
		await nextTick();
		expect(trigger?.props.disabled).toBe(false);
		dispatch(trigger, "onClick");
		const dialog = nodes(root, "dialog")[0];
		expect(dialog?.open).toBe(true);
		expect(nodes(root, "img")[1]?.props.src).toBe(
			"https://example.com/full.png",
		);
		dispatch(dialog, "onKeydown", { key: "Escape" });
		expect(dialog?.open).toBe(false);
		dispatch(trigger, "onClick");
		dispatch(nodes(root, "button")[1], "onClick");
		expect(dialog?.open).toBe(false);
	});

	test("changing only an inactive icon preserves loaded artwork and dialog readiness", async () => {
		const { root, props } = mountImage();
		dispatch(nodes(root, "img")[0], "onLoad");
		await nextTick();
		const image = nodes(root, "img")[0];
		props.icon = "https://example.com/new-icon.png";
		await nextTick();
		expect(nodes(root, "img")[0]).toBe(image);
		expect(nodes(root, "button")[0]?.props.disabled).toBe(false);
		dispatch(nodes(root, "button")[0], "onClick");
		expect(nodes(root, "dialog")[0]?.open).toBe(true);
		dispatch(image, "onError");
		await nextTick();
		expect(nodes(root, "img")[0]?.props.src).toBe(props.icon);
		expect(nodes(root, "button")[0]?.props.disabled).toBe(true);
		expect(nodes(root, "dialog")[0]?.open).toBe(false);
		dispatch(nodes(root, "img")[0], "onLoad");
		await nextTick();
		expect(nodes(root, "button")[0]?.props.disabled).toBe(false);
	});

	test("failed artwork falls back to icon, then a bounded generated placeholder; new URLs reset", async () => {
		const { root, props } = mountImage();
		dispatch(nodes(root, "img")[0], "onError");
		await nextTick();
		expect(nodes(root, "img")[0]?.props.src).toBe(
			"https://example.com/icon.png",
		);
		dispatch(nodes(root, "img")[0], "onError");
		await nextTick();
		expect(nodes(root, "img")[0]?.props.src).toStartWith(
			"data:image/svg+xml;base64,",
		);
		dispatch(nodes(root, "img")[0], "onError");
		await nextTick();
		expect(text(root)).toContain("Image unavailable");
		expect(nodes(root, "button")[0]?.props.disabled).toBe(true);
		props.image = "https://example.com/recovered.png";
		await nextTick();
		expect(nodes(root, "img")[0]?.props.src).toBe(props.image);
		expect(text(root)).toContain("Loading image…");
	});
});

describe("NFT page navigation", () => {
	test("lookahead is not rendered and adjacent pages preserve repeated commitments", () => {
		const outputs = Array.from({ length: 49 }, (_, index) =>
			nft("01", String(index)),
		);
		const first = nftPage(outputs.slice(0, 25), 24);
		const second = nftPage(outputs.slice(24, 49), 24);
		const last = nftPage(outputs.slice(48), 24);
		expect(first.items).toHaveLength(24);
		expect(first.hasNextPage).toBe(true);
		expect(second.hasNextPage).toBe(true);
		expect(last.hasNextPage).toBe(false);
		expect(
			new Set(
				[...first.items, ...second.items, ...last.items].map((item) => item.id),
			).size,
		).toBe(49);
		expect(nftPage(outputs.slice(0, 24), 24).hasNextPage).toBe(false);
		expect(nftPage([], 24).items).toEqual([]);
	});

	test("mode, address/category and network changes reset offset; loading blocks navigation", () => {
		const scope = effectScope();
		scope.run(() => {
			const context = reactive({
				network: "mainnet",
				identity: "collection-a",
				mode: "grid",
			});
			const pager = useNftPagination(
				() => `${context.network}:${context.identity}`,
				() => context.mode,
			);
			expect(pager.limit.value).toBe(25);
			pager.next(false, true);
			expect(pager.offset.value).toBe(24);
			pager.next(true, true);
			pager.previous(true);
			expect(pager.offset.value).toBe(24);
			context.mode = "table";
			expect(pager.offset.value).toBe(0);
			expect(pager.limit.value).toBe(9);
			pager.next(false, false);
			expect(pager.offset.value).toBe(0);
			pager.next(false, true);
			context.identity = "address-b";
			expect(pager.offset.value).toBe(0);
			pager.next(false, true);
			context.network = "chipnet";
			expect(pager.offset.value).toBe(0);
			pager.previous(false);
			expect(pager.offset.value).toBe(0);
		});
		scope.stop();
	});
});

describe("address and collection gallery integration", () => {
	const components = {
		BasePagination,
		LoadingSpinner: { render: () => h("span", "spinner") },
		BaseCopy: CopyFixture,
		TableView: { render: () => h("div", "NFT table") },
	};

	test("address NFTs switch from table to gallery, paginate and retry using the real query bindings", async () => {
		const props = reactive({ lockingBytecode: "76a914fixture88ac" });
		const { root, unmount } = mountFixture(AddressNFTs, props, components);
		cleanup.add(unmount);
		expect(text(root)).toContain("NFT table");
		expect(queryVariables.value.limit).toBe(9);
		dispatch(
			nodes(root, "button").find((node) => node.text === "grid_view"),
			"onClick",
		);
		await nextTick();
		expect(queryVariables.value.limit).toBe(25);
		expect(nodes(root, "article")).toHaveLength(24);
		expect(
			nodes(root, "a").filter((node) => node.props.href === "/address/zowner"),
		).toHaveLength(24);
		dispatch(
			nodes(root, "button").find(
				(node) => node.props["aria-label"] === "Next page",
			),
			"onClick",
		);
		await nextTick();
		expect(queryVariables.value.offset).toBe(24);
		query.result.value = {
			output: fixtureOutputs.slice(24),
			search_output: fixtureOutputs.slice(24),
		};
		await nextTick();
		expect(nodes(root, "article")).toHaveLength(1);
		expect(
			nodes(root, "button").find(
				(node) => node.props["aria-label"] === "Next page",
			)?.props.disabled,
		).toBe(true);
		query.error.value = new Error("Indexer offline");
		await nextTick();
		dispatch(
			nodes(root, "button").find((node) => node.text === "Try again"),
			"onClick",
		);
		expect(query.refetch).toHaveBeenCalledTimes(1);
		query.error.value = undefined;
		props.lockingBytecode = "other-address";
		await nextTick();
		expect(queryVariables.value.offset).toBe(0);
	});

	test("collection outputs become distinct outpoints and reset pages on category or view changes", async () => {
		// The page passes its complete unspent snapshot; minting NFTs, burns and
		// a repeated outpoint must not appear as extra cards.
		const outputs = [
			...fixtureOutputs,
			fixtureOutputs[3],
			{
				...fixtureOutputs[0],
				output_index: "90",
				nonfungible_token_capability: "minting",
			},
			{ ...fixtureOutputs[0], output_index: "91", locking_bytecode: "\\x6a" },
		];
		const props = reactive({
			category: "ab".repeat(32),
			viewMode: "grid",
			outputs: { status: "ready", value: outputs },
			identitySnapshot: {
				name: "Selected collection",
				token: {
					category: "ab".repeat(32),
					symbol: "NFT",
					nfts: {
						parse: {
							types: {
								"00ff": {
									name: "Selected NFT",
									uris: { image: "https://example.com/selected.png" },
								},
							},
						},
					},
				},
			},
		});
		const { root, unmount } = mountFixture(TokenChild, props, components);
		cleanup.add(unmount);
		expect(nodes(root, "article")).toHaveLength(24);
		expect(
			nodes(root, "a").filter((node) => node.props.href === "/address/zowner"),
		).toHaveLength(24);
		expect(text(root)).toContain("Selected NFT");
		expect(text(root)).not.toContain("Metadata unavailable");
		expect(nodes(root, "img")[0]?.props.src).toBe(
			"https://example.com/selected.png",
		);
		const outputLinks = nodes(root, "a").filter((node) =>
			String(node.props.href).startsWith("/tx/"),
		);
		expect(new Set(outputLinks.map((node) => node.text)).size).toBe(24);
		dispatch(
			nodes(root, "button").find(
				(node) => node.props["aria-label"] === "Next page",
			),
			"onClick",
		);
		await nextTick();
		// 25 distinct non-minting NFTs: the second page holds the last one.
		expect(nodes(root, "article")).toHaveLength(1);
		props.category = "cd".repeat(32);
		await nextTick();
		expect(nodes(root, "article")).toHaveLength(24);
		props.viewMode = "table";
		await nextTick();
		expect(text(root)).toContain("NFT table");
	});
});
