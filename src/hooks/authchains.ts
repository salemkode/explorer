import { decodeAuthChain } from "~/module/bcmr";
import { GetAuthChains } from "~/module/chaingraph";
import { useRegistryStore, useStateStore } from "~/store";
import type { bytea } from "~/types";

/**
 * Custom hook that fetches and decodes auth chains for the specified token categories.
 *
 * @param tokenCategories - The categories of tokens to fetch auth chains for.
 * @returns The result of the auth chains query.
 */
export const useAuthChains = (tokenCategories: Ref<bytea[]>) => {
	const stateStore = useStateStore();
	const registryStore = useRegistryStore();

	// Fetch auth chains for the specified token categories
	const query = useQuery(GetAuthChains, {
		network: stateStore.network,
		tokenCategory: Array.from(new Set(tokenCategories.value)),
	});

	// Add decoded auth chains to the registry store
	query.onResult((authChain) => {
		for (const category of tokenCategories.value) {
			// Get token category
			const authchainElement = decodeAuthChain(
				authChain.data,
				category.substring(2),
			);
			if (authchainElement)
				registryStore.addToken(
					category.substring(2),
					authchainElement.opreturn,
				);
		}
	});

	return query;
};
