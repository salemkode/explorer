import { hexToBin, lockingBytecodeToCashAddress } from "@bitauth/libauth";
import { provideApolloClient } from "@vue/apollo-composable";
import { defineStore } from "pinia";
import { GetLastBlock } from "~/module/chaingraph";

export const useStateStore = defineStore("state", () => {
	const network = ref("mainnet" as "mainnet" | "chipnet");

	try {
		const nuxtApp = useNuxtApp();
		const client =
			// biome-ignore lint/suspicious/noExplicitAny: apollo client
			(nuxtApp as any).$apollo?.defaultClient ||
			// biome-ignore lint/suspicious/noExplicitAny: apollo client
			(nuxtApp as any).$apollo?.clients?.default;
		if (client) {
			provideApolloClient(client);
		}
	} catch {
		// outside nuxt context
	}

	const { result: lastBlock } = useSubscription(GetLastBlock, () => ({
		network: network.value,
	}));
	const lastBlockHeight = computed(
		() => lastBlock.value?.node_block.at(0)?.block.height || "0",
	);

	const lockingBytecodeHexToCashAddress = (
		hexCode: string,
		tokenSupport = true,
	) => {
		const bytecode = hexToBin(hexCode);
		const address = lockingBytecodeToCashAddress(
			bytecode,
			network.value === "mainnet" ? "bitcoincash" : "bchtest",
			{
				tokenSupport,
			},
		);

		return typeof address === "string" ? address : undefined;
	};

	return {
		network,
		lastBlockHeight,
		lockingBytecodeHexToCashAddress,
	};
});
