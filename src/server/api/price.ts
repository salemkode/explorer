// https:markets.api.bitcoin.com / rates ? c = BCH
export default defineEventHandler(async () => {
  const price = await fetch("https://markets.api.bitcoin.com/rates?c=BCH");
  const priceJSON: {
    code: string;
    name: string;
    time: number;
    rate: number;
  }[] = await price.json();
  return {
    usd: `${priceJSON.find((api) => api.code === "USD")?.rate || 0}`,
  };
});
