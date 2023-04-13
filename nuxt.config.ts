export default defineNuxtConfig({
  ssr: false,
  app: {
    pageTransition: { name: "fade", mode: "out-in" },
    head: {
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
  modules: [
    "@nuxtjs/apollo",
    "@nuxtjs/i18n",
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
  },
});
