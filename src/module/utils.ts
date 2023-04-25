import BigNumber from "bignumber.js";
import type { bigNum } from "~/types";
import { satToBch } from "./bitcoin";

export const bytesToMB = (bytes: number) => {
  // One megabyte is equal to 1024 * 1024 bytes
  const MB = 1024 * 1024;
  // Divide the bytes by MB and round the result to two decimal places
  const mb = Math.round((bytes / MB) * 100) / 100;
  // Return the result
  return mb;
};

export const calculatePrice = (sat: bigNum, price: bigNum) => {
  const bchNum = satToBch(sat);
  const bigNum = BigNumber(bchNum);
  return bigNum.multipliedBy(price).decimalPlaces(3);
};

export const numberWithCommas = (num: bigNum) => {
  return BigNumber(num).toFormat();
};

export const formatDateString = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  const dateString = date.toLocaleString("en-US", options).replace(",", "");
  return dateString;
};

export const shortTx = (text: string) =>
  `${text.slice(0, 8)}...${text.slice(-5)}`;

export const isServer = process.server;

export const isIpfs = (url: string): boolean => {
  return url.startsWith("ipfs://");
};

export const getHttpsUrl = (url: string) => {
  if (isIpfs(url)) {
    return `https://dweb.link/ipfs/${url.substring(7)}`;
  } else {
    return url;
  }
};
