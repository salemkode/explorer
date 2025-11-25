import codegen from "vite-plugin-graphql-codegen";
import { watch } from "vite-plugin-watch";

export default defineNuxtConfig({
	ssr: false,

	app: {
		pageTransition: { name: "fade", mode: "out-in" },
		head: {
			htmlAttrs: {
				lang: "en",
			},
			title: "Bitcoin Cash Explorer",
			link: [
				{
					rel: "icon",
					sizes: "32x32",
					href: "/bch.svg",
				},
				{
					rel: "stylesheet",
					href: "/font/uicon.css",
				},
			],
		},
	},

	css: ["~/assets/theme.scss"],
	srcDir: "src",
	pages: true,
	components: true,
	modules: ["@nuxtjs/apollo", "@nuxtjs/i18n", "@pinia/nuxt"],

	i18n: {
		restructureDir: "",
		// add `vueI18n` option to `@nuxtjs/i18n` module options
		langDir: "src/locales/",
		locales: [{ code: "en", language: "english", file: "en.js", dir: "ltr" }],
		defaultLocale: "en",
	},

	apollo: {
		clients: {
			default: {
				httpEndpoint: process.env.CHAINGRAPH_HTTP || "",
				wsEndpoint: process.env.CHAINGRAPH_WS || "",
			},
		},
	},

	build: {
		transpile: ["@nuxtjs/apollo"],
	},

	vue: {
		compilerOptions: {
			isCustomElement: (tag) => tag === "qr-code",
		},
	},

	vite: {
		build: {
			target: "esnext",
		},
		optimizeDeps: {
			esbuildOptions: {
				define: { global: "globalThis" },
				target: "esnext",
				plugins: [],
			},
		},
		plugins: [
			codegen(),
			watch({
				pattern: "src/assets/icons/**/*.svg",
				command: "node ./script/iconGenerate.mjs",
				onInit: true,
			}),
		],
	},

	typescript: {
		strict: true,
	},

	compatibilityDate: "2024-09-13",
});
