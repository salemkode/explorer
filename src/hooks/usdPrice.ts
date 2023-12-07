import { number, object, parse } from "valibot";
import { satToBch } from "~/module/bitcoin";
import * as utils from "~/module/utils";

const priceSchema = object({
  "bitcoin-cash": object({
    usd: number(),
  }),
});

export const useUsdPrice = () => {
  const { data: responseResult } = useFetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=usd"
  );
  const usdPrice = computed(() => {
    const { "bitcoin-cash": result } = parse(priceSchema, responseResult.value);
    return result.usd;
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
