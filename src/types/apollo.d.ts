import type { Client } from "graphql-ws";

// Nuxt Apollo exposes its restartable graphql-ws clients at runtime.
// Listen to the existing connection; do not open a second status socket.
declare module "#app" {
	interface NuxtApp {
		_apolloWsClients?: Record<string, Client>;
	}
}
