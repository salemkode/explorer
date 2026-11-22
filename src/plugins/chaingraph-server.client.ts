import { NuxtApollo } from "#apollo";
import {
	readStoredChaingraphUrl,
	resolveChaingraphEndpoint,
} from "~/module/chaingraphServer";

/**
 * Applies the Chaingraph server chosen in Settings before the Apollo plugin
 * creates its clients (`enforce: "pre"`). Changing the server reloads the page.
 */
export default defineNuxtPlugin({
	name: "chaingraph-server",
	enforce: "pre",
	setup() {
		const config = useRuntimeConfig().public;
		const endpoint = resolveChaingraphEndpoint(readStoredChaingraphUrl(), {
			httpUrl: config.chaingraphHttp,
			wsUrl: config.chaingraphWs,
		});
		const client = NuxtApollo.clients.default;
		client.httpEndpoint = endpoint.httpUrl;
		client.wsEndpoint = endpoint.wsUrl;
		return { provide: { chaingraph: endpoint } };
	},
});
