import { z } from "zod";

const priceSchema = z
  .object({
    code: z.string(),
    name: z.string(),
    time: z.number(),
    rate: z.number(),
  })
  .array();

export default defineEventHandler(async () => {
  const response = await fetch(
    "https://markets.api.bitcoin.com/rates?c=BCH"
  ).then((res) => res.json());
  const price = priceSchema.safeParse(response);

  if (!price.success) {
    return {
      success: price.success,
      usd: "0",
    };
  }

  return {
    success: price.success,
    usd: `${price.data.find((api) => api.code === "USD")?.rate || 0}`,
  };
});
