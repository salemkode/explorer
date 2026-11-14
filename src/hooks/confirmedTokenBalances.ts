import {
	GetTokenBalanceBlock,
	GetTokenBalanceOutputs,
} from "~/module/tokenBalanceQueries";
import { loadTokenBalances, TokenBalanceError } from "~/module/tokenBalances";
import { useTokenBalanceSnapshot } from "./tokenBalances";

export function useConfirmedTokenBalances(
	scope: Readonly<Ref<Parameters<typeof loadTokenBalances>[0] | null>>,
) {
	const { clients } = useApollo();
	const client = clients?.default;
	return useTokenBalanceSnapshot(scope, (current, signal) =>
		loadTokenBalances(
			current,
			{
				async block(height, node) {
					const result = await client?.query({
						query: GetTokenBalanceBlock,
						variables: {
							network: current.network,
							height: height ? { _eq: height } : {},
							node: node === undefined ? {} : { _eq: node },
						},
						fetchPolicy: "no-cache",
						context: { fetchOptions: { signal }, queryDeduplication: false },
					});
					if (!result)
						throw new TokenBalanceError("The balance service is unavailable.");
					return result.data.block;
				},
				async outputs(where) {
					const result = await client?.query({
						query: GetTokenBalanceOutputs,
						variables: { where, limit: 500 },
						fetchPolicy: "no-cache",
						context: { fetchOptions: { signal }, queryDeduplication: false },
					});
					if (!result)
						throw new TokenBalanceError("The balance service is unavailable.");
					return result.data.output;
				},
			},
			signal,
		),
	);
}
