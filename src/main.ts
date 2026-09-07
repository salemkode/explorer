import { provideApolloClient } from "@vue/apollo-composable";
import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import { apolloClient } from "./apollo";
import i18n from "./i18n";
import { registerComponents } from "./plugins/components";
import { createAppRouter } from "./router";
import "./assets/theme.scss";

const app = createApp(App);

app.use(createPinia());
app.use(i18n);
app.use(createAppRouter());
registerComponents(app);

// Global Apollo client for all useQuery/useSubscription composables
provideApolloClient(apolloClient);

app.mount("#app");
