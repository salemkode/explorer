import BigNumber from "bignumber.js";
import { satToBch } from "./bitcoin";
import type { bigNum, Registry } from "~/types";
import type { ValidateFunction } from "ajv";

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

let validate_bcmr: ValidateFunction<Registry> | undefined;
export const validateBcmrSchema = async (value: unknown) => {
  if (!validate_bcmr) {
    const { default: Ajv } = await import("ajv");
    const schema_bcmr = await import("@/assets/bcmr-v2.schema.json");

    // Create bitcoin cash metadata registry validator
    const ajv = new Ajv({
      strictTypes: false,
    });
    validate_bcmr = ajv.compile(schema_bcmr);
  }

  if (validate_bcmr(value)) {
    return {
      success: true,
      value: value as Registry,
    } as const;
  }

  return {
    success: false,
  } as const;
};
