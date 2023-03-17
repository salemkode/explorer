// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
  appConfig: {
    chaingraph:
      "https://demo.chaingraph.cash/v1/graphql" ||
      process.env.CHAINGRAPH_URL ||
      "",
    network: process.env.NETWORK || "chipnet",
  },
  build: {
    transpile: ["@nuxtjs/apollo"],
  },
});
