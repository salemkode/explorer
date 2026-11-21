import { computed, watch } from "vue";
import { decodeAuthChain } from "~/module/bcmr";
import { GetAuthChains } from "~/module/chaingraph";
import { useRegistryStore, useStateStore } from "~/store";
import type { bytea } from "~/types";
import { useScopedQuery } from "./scopedQuery";

/**
 * Custom hook that fetches and decodes auth chains for the specified token categories.
 *
 * @param tokenCategories - The categories of tokens to fetch auth chains for.
 * @returns The result of the auth chains query.
 */
export const useAuthChains = (
	tokenCategories: Ref<bytea[]>,
	cacheMetadata = true,
) => {
	const stateStore = useStateStore();
	const registryStore = useRegistryStore();

	// Fetch auth chains for the specified token categories
	const query = useScopedQuery(
		GetAuthChains,
		computed(() => ({
			network: stateStore.network,
			tokenCategory: Array.from(new Set(tokenCategories.value)),
		})),
	);

	// Add decoded auth chains to the registry store
	watch(
		query.result,
		(authChain) => {
			if (!authChain || !cacheMetadata) return;
			for (const category of tokenCategories.value) {
				// Get token category
				const authchainElement = decodeAuthChain(
					authChain,
					category.substring(2),
				);
				if (authchainElement)
					registryStore.addToken(
						category.substring(2),
						authchainElement.opreturn,
					);
			}
		},
		{ immediate: true },
	);

	return query;
};
