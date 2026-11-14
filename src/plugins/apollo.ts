import {
	provideApolloClient,
	provideApolloClients,
} from "@vue/apollo-composable";

export default defineNuxtPlugin((nuxtApp) => {
	// biome-ignore lint/suspicious/noExplicitAny: apollo client instance
	const apollo = (nuxtApp as any).$apollo;
	const defaultClient = apollo?.defaultClient || apollo?.clients?.default;

	if (defaultClient) {
		provideApolloClient(defaultClient);
	}
	if (apollo?.clients) {
		provideApolloClients(apollo.clients);
	}
});
