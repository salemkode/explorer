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

/**
 * Dispose the previous observer before exposing a new identifier or network.
 * While `enabled` is false no request is sent and the query reports no result.
 */
export function useScopedQuery<TData, TVariables extends OperationVariables>(
	document: TypedDocumentNode<TData, TVariables>,
	variables: MaybeRefOrGetter<TVariables>,
	enabled: MaybeRefOrGetter<boolean> = true,
) {
	const { client } = useApolloClient();
	const query = shallowRef<ReturnType<typeof useQuery<TData, TVariables>>>();
	watch(
		() => (toValue(enabled) ? JSON.stringify(toValue(variables)) : undefined),
		(key, _previous, onCleanup) => {
			if (key === undefined) {
				query.value = undefined;
				return;
			}
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
		loading: computed(() =>
			query.value ? query.value.loading.value : !!toValue(enabled),
		),
		error: computed(() => query.value?.error.value),
		refetch: () => query.value?.refetch(),
	};
}
