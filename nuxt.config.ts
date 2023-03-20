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
          href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css",
          rel: "stylesheet",
          integrity:
            "sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD",
          crossorigin: "anonymous",
        },
      ],
    },
  },
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
