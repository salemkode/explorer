import { number, object, safeParse } from "valibot";
import { satToBch } from "~/module/bitcoin";
import * as utils from "~/module/utils";

const priceSchema = object({
	"bitcoin-cash": object({
		usd: number(),
	}),
});

const btcPriceInUsd = ref<number>();

// Fetch the price once per app load, shared by every consumer of this hook
let priceRequested = false;
const loadPrice = () => {
	if (priceRequested) return;
	priceRequested = true;

	fetch(
		"https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=usd",
	)
		.then((response) => response.json())
		.then((json) => {
			const parsed = safeParse(priceSchema, json);
			if (parsed.success) {
				btcPriceInUsd.value = parsed.output["bitcoin-cash"].usd;
			}
		})
		.catch(() => undefined);
};

export const useUsdPrice = () => {
	loadPrice();

	const usdPrice = computed(() => btcPriceInUsd.value || 0);

	const calculatePrice = (sat: string | number) => {
		return utils.calculatePrice(sat, usdPrice.value || "");
	};

	// TODO: change name of this function to something more descriptive
	const formatPrice = (sat: string | number) => {
		if (!sat || sat === "0") return undefined;
		return `${satToBch(sat, 3)}BCH • $${calculatePrice(sat)}`;
	};

	return {
		usdPrice,
		formatPrice,
		calculatePrice,
	};
};
