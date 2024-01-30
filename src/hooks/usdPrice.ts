import { number, object, safeParse } from "valibot";
import { satToBch } from "~/module/bitcoin";
import * as utils from "~/module/utils";

const priceSchema = object({
  "bitcoin-cash": object({
    usd: number(),
  }),
});

const { data: btcPriceInUsd } = useFetch(
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=usd"
);

export const useUsdPrice = () => {
  const usdPrice = computed(() => {
    const response = safeParse(priceSchema, btcPriceInUsd.value);
    if (!response.success) return 0;

    return response.output["bitcoin-cash"].usd;
  });

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
