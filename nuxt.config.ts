import eslint from "vite-plugin-eslint";
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
      ],
    },
  },
  css: ["~/assets/theme.scss"],
  srcDir: "src",
  pages: true,
  components: true,
  modules: ["@nuxtjs/apollo", "@nuxtjs/i18n", "@pinia/nuxt"],
  i18n: {
    // add `vueI18n` option to `@nuxtjs/i18n` module options
    langDir: "locales/",
    locales: [{ code: "en", iso: "en-US", file: "en.js", dir: "ltr" }],
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
      eslint({
        failOnError: false,
      }),
      watch({
        pattern: "src/assets/icons/**/*.svg",
        command: "node ./script/iconGenerate.mjs",
      }),
    ],
  },
});
