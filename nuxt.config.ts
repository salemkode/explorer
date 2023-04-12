import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
const EMPTY_PATH = require.resolve(
  "rollup-plugin-node-polyfills/polyfills/empty.js"
);

export default defineNuxtConfig({
  ssr: false,
  app: {
    head: {
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
  modules: [
    "@nuxtjs/apollo",
    "@nuxtjs/i18n",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
  ],
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
      NodeGlobalsPolyfillPlugin({
        process: true,
        buffer: true,
      }),
    ],
    resolve: {
      alias: {
        bufferutil: EMPTY_PATH,
        child_process: EMPTY_PATH,
        crypto: EMPTY_PATH,
        dns: EMPTY_PATH,
        events: require.resolve("events/"),
        eventsource: EMPTY_PATH,
        fs: EMPTY_PATH,
        http: EMPTY_PATH,
        https: EMPTY_PATH,
        libpq: EMPTY_PATH,
        module: EMPTY_PATH,
        net: EMPTY_PATH,
        os: EMPTY_PATH,
        "parse-database-url": EMPTY_PATH,
        path: EMPTY_PATH,
        pg: EMPTY_PATH,
        "pg-format": EMPTY_PATH,
        "pg-native": EMPTY_PATH,
        solc: EMPTY_PATH,
        tls: EMPTY_PATH,
        url: EMPTY_PATH,
        zlib: EMPTY_PATH,

        stream: require.resolve("stream-browserify"),
      },
    },
  },
});
