import type { OperationVariables } from "@apollo/client/core";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import {
	provideApolloClient,
	useApolloClient,
	useQuery,
} from "@vue/apollo-composable";
import {
	computed,
	effectScope,
	type MaybeRefOrGetter,
	shallowRef,
	toValue,
	watch,
} from "vue";

/** Dispose the previous observer before exposing a new identifier or network. */
export function useScopedQuery<TData, TVariables extends OperationVariables>(
	document: TypedDocumentNode<TData, TVariables>,
	variables: MaybeRefOrGetter<TVariables>,
) {
	const { client } = useApolloClient();
	const query = shallowRef<ReturnType<typeof useQuery<TData, TVariables>>>();
	watch(
		() => JSON.stringify(toValue(variables)),
		(_key, _previous, onCleanup) => {
			const scope = effectScope();
			query.value = scope.run(() =>
				provideApolloClient(client)(() =>
					useQuery(document, toValue(variables)),
				),
			);
			onCleanup(() => scope.stop());
		},
		{ immediate: true, flush: "sync" },
	);

	return {
		result: computed(() => query.value?.result.value),
		loading: computed(() => query.value?.loading.value ?? true),
		error: computed(() => query.value?.error.value),
		refetch: () => query.value?.refetch(),
	};
}
