import {
	ApolloClient,
	HttpLink,
	InMemoryCache,
	split,
} from "@apollo/client/core";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

const httpEndpoint = import.meta.env.VITE_CHAINGRAPH_HTTP;
const wsEndpoint = import.meta.env.VITE_CHAINGRAPH_WS;

const httpLink = new HttpLink({ uri: httpEndpoint });

// Subscriptions (live blocks / mempool) run over the WebSocket link,
// everything else over HTTP. Without a WS endpoint subscriptions
// gracefully fall back to the HTTP link.
const wsLink = wsEndpoint
	? new GraphQLWsLink(
			createClient({
				url: wsEndpoint,
				lazy: true,
			}),
		)
	: undefined;

const link = wsLink
	? split(
			({ query }) => {
				const definition = getMainDefinition(query);
				return (
					definition.kind === "OperationDefinition" &&
					definition.operation === "subscription"
				);
			},
			wsLink,
			httpLink,
		)
	: httpLink;

export const apolloClient = new ApolloClient({
	link,
	cache: new InMemoryCache(),
});
