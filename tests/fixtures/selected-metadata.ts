import { expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { compileScript, parse } from "@vue/compiler-sfc";
import { renderToString } from "@vue/server-renderer";
import { plugin } from "bun";
import {
	computed,
	createSSRApp,
	defineComponent,
	effectScope,
	h,
	nextTick,
	reactive,
	ref,
	watch,
} from "vue";

Object.assign(globalThis, { computed, ref, reactive, watch });
mock.module("../../src/store/index.ts", () => ({
	useRegistryStore: () => ({
		getToken: () => ({
			token: { name: "Wrong registry", icon: "https://wrong/icon.png" },
		}),
	}),
}));
mock.module("../../src/module/utils.ts", () => ({
	getHttpsUrl: (url: string) => url,
	svgToBase64: () => "data:placeholder",
	validateBcmrSchema: () => ({ success: false }),
}));
plugin({
	name: "selected-metadata-sfc",
	setup(build) {
		// The readiness regression exercises the real compiled setup without DOM
		// animation or Teleport behavior. Normal rendering tests keep the template.
		build.onLoad({ filter: /.*/, namespace: "icon-setup" }, ({ path }) => ({
			contents: compileScript(
				parse(readFileSync(path, "utf8"), { filename: path }).descriptor,
				{ id: path, inlineTemplate: false },
			).content,
			loader: "ts",
		}));
		build.onLoad({ filter: /\.vue$/ }, ({ path }) => ({
			contents: compileScript(
				parse(readFileSync(path, "utf8"), { filename: path }).descriptor,
				{ id: path, inlineTemplate: true },
			).content,
			loader: "ts",
		}));
	},
});
const { default: Icon } = await import("../../src/components/bcmr/Icon.vue");
const { default: Info } = await import("../../src/components/bcmr/Info.vue");
const { default: ContentWarp } = await import(
	"../../src/components/ContentWarp.vue"
);
const Image = defineComponent({
	props: ["href", "alt"],
	setup: (props) => () => h("img", { src: props.href, alt: props.alt }),
});
const identity = {
	name: "Historical selection",
	uris: {
		icon: "https://selected/icon.png",
		image: "https://selected/image.png",
	},
};
async function render(
	component: typeof Icon | typeof Info,
	props: Record<string, unknown>,
) {
	const app = createSSRApp(component, props);
	app.component("Image", Image);
	app.component("BcmrIcon", Icon);
	app.component("ContentWarp", ContentWarp);
	app.component("BaseCopy", { render: () => h("span") });
	return renderToString(app);
}
test("BCMR info forwards the selected historical/provider image instead of the registry default", async () => {
	const html = await render(Info, {
		tokenCategory: "ab".repeat(32),
		identitySnapshot: identity,
		loading: false,
	});
	expect(html).toContain("Historical selection");
	expect(html).toContain("https://selected/icon.png");
	expect(html).not.toContain("https://wrong/icon.png");
});
test("icon selection distinguishes an explicit missing revision from an omitted selection", async () => {
	const selected = await render(Icon, {
		tokenCategory: "ab".repeat(32),
		identitySnapshot: identity,
	});
	expect(selected).toContain("https://selected/icon.png");
	const missing = await render(Icon, {
		tokenCategory: "ab".repeat(32),
		identitySnapshot: null,
	});
	expect(missing).not.toContain("https://wrong/icon.png");
	expect(missing).not.toContain("https://selected/icon.png");
	const omitted = await render(Icon, { tokenCategory: "ab".repeat(32) });
	expect(omitted).toContain("https://wrong/icon.png");
});

test("a same-icon provider switch preserves readiness and opens the newly selected artwork", async () => {
	const setupModule = `icon-setup:${new URL("../../src/components/bcmr/Icon.vue", import.meta.url).pathname}`;
	const { default: SetupIcon } = await import(setupModule);
	const props = reactive({
		tokenCategory: "ab".repeat(32),
		identitySnapshot: identity,
	});
	const scope = effectScope();
	try {
		const api = scope.run(() => SetupIcon.setup(props, { expose() {} }));
		expect(api.iconURL.value).toBe("https://selected/icon.png");
		// The actual thumbnail emits success after its first successful load.
		api.state.success = true;
		api.openPopUp();
		expect(api.state.open).toBe(true);
		props.identitySnapshot = {
			name: "Second provider",
			uris: { icon: identity.uris.icon, image: "https://second/image.png" },
		};
		await nextTick();
		expect(api.iconURL.value).toBe(identity.uris.icon);
		expect(api.state.open).toBe(false);
		expect(api.state.success).toBe(true);
		api.openPopUp();
		expect(api.state.open).toBe(true);
		expect(api.imageURL.value).toBe("https://second/image.png");
		props.identitySnapshot = {
			name: "Different icon",
			uris: {
				icon: "https://third/icon.png",
				image: "https://third/image.png",
			},
		};
		await nextTick();
		expect(api.state.success).toBe(false);
		api.openPopUp();
		expect(api.state.open).toBe(false);
	} finally {
		scope.stop();
	}
});
