import { expect, test } from "bun:test";
import { compileScript, parse } from "@vue/compiler-sfc";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";

Bun.plugin({
	name: "compile-qr-component",
	setup(build) {
		build.onLoad({ filter: /\/VueQrCode\.vue$/ }, async ({ path }) => {
			const { descriptor } = parse(await Bun.file(path).text(), {
				filename: path,
			});
			const { content } = compileScript(descriptor, {
				id: path,
				inlineTemplate: true,
			});
			return { contents: content, loader: "ts" };
		});
	},
});

const { default: VueQrCode } = await import("../src/components/VueQrCode.vue");

test("renders the address QR graphic on the first render at either size", async () => {
	const content = "bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a";
	const preview = await renderToString(
		createSSRApp(VueQrCode, { content, size: 112 }),
	);
	const enlarged = await renderToString(
		createSSRApp(VueQrCode, { content, size: 272 }),
	);

	expect(preview).toContain("<svg");
	expect(preview).toContain('width="112"');
	expect(preview).toContain('fill="#1c7d43"');
	expect(preview.match(/stroke="#13532d"/g)).toHaveLength(3);
	expect(preview.match(/fill="#70c559"/g)).toHaveLength(3);
	expect(enlarged).toContain('width="272"');
	const path = preview.match(/<path[^>]+d="[^"]+"/)?.[0];
	expect(path).toBeDefined();
	expect(enlarged.match(/<path[^>]+d="[^"]+"/)?.[0]).toBe(path);
});
