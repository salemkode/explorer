export const getBchPrice = async () => {
  const response = await fetch("https://api.fullstack.cash/v5/price/usd");
  const data: { usd: string } = await response.json();
  return data.usd;
};
