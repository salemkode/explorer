import BigNumber from "bignumber.js";
type num = number | string | BigNumber;
export const satToBch = (num: num) => {
  const bigNum = BigNumber(num);
  return bigNum.div(Math.pow(10, 8)).toString();
};

export const calculatePrice = (sat: string, price: string) => {
  const bchNum = satToBch(sat);
  const bigNum = BigNumber(bchNum);
  return bigNum.multipliedBy(price).decimalPlaces(3);
};

export const numberWithCommas = (num: num) => {
  return BigNumber(num).toFormat();
};
