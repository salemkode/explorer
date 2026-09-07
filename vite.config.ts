import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import { defineConfig, loadEnv } from "vite";
import graphqlCodegen from "vite-plugin-graphql-codegen";
import { watch } from "vite-plugin-watch";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	return {
		publicDir: "src/public",
		plugins: [
			vue({
				template: {
					compilerOptions: {
						isCustomElement: (tag) => tag === "qr-code",
					},
					// Absolute URLs reference files in public/ — leave them as-is
					transformAssetUrls: { includeAbsolute: false },
				},
			}),
			AutoImport({
				imports: [
					"vue",
					"vue-router",
					{
						"@vue/apollo-composable": [
							"useQuery",
							"useLazyQuery",
							"useSubscription",
							"useMutation",
							"useResult",
							"useApolloClient",
						],
					},
					{
						"vue-i18n": ["useI18n"],
					},
					{
						"~/graphql/gql": ["gql"],
					},
				],
				dts: "src/types/auto-imports.d.ts",
			}),
			graphqlCodegen(),
			watch({
				pattern: "src/assets/icons/**/*.svg",
				command: "node ./script/iconGenerate.mjs",
				onInit: true,
			}),
		],
		resolve: {
			alias: {
				"~": fileURLToPath(new URL("./src", import.meta.url)),
				"@": fileURLToPath(new URL("./src", import.meta.url)),
				// electrum-cash v3 declares a browser build but doesn't ship it;
				// stub the Node builtins it pulls in for TCP transports (we use wss)
				net: fileURLToPath(
					new URL("./src/stubs/nodeNetTls.ts", import.meta.url),
				),
				tls: fileURLToPath(
					new URL("./src/stubs/nodeNetTls.ts", import.meta.url),
				),
			},
		},
		define: {
			// Also accept the legacy env names used on the existing hosting setup
			"import.meta.env.VITE_CHAINGRAPH_HTTP": JSON.stringify(
				env.VITE_CHAINGRAPH_HTTP ?? env.CHAINGRAPH_HTTP ?? "",
			),
			"import.meta.env.VITE_CHAINGRAPH_WS": JSON.stringify(
				env.VITE_CHAINGRAPH_WS ?? env.CHAINGRAPH_WS ?? "",
			),
		},
		build: {
			target: "esnext",
		},
		optimizeDeps: {
			esbuildOptions: {
				define: { global: "globalThis" },
				target: "esnext",
			},
		},
	};
});
