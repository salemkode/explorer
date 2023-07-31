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

export const toObject = (value: unknown) => {
  return typeof value === "object" && value !== null && value;
};
export const calculatePrice = (sat: bigNum, price: bigNum) => {
  const bchNum = satToBch(sat);
  const bigNum = BigNumber(bchNum).multipliedBy(price);
  const decimal = bigNum.isLessThanOrEqualTo(1) ? 3 : 2;
  return bigNum.decimalPlaces(decimal).toString();
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

export const isServer = !!process.server;

export const isIpfs = (url: string): boolean => {
  return url.startsWith("ipfs://");
};

export const getHttpsUrl = (url: string) => {
  if (isIpfs(url)) {
    return `https://ipfs.pat.mn/ipfs/${url.substring(7)}`;
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

const formatter = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
});

const DIVISIONS = [
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" },
  { amount: 7, name: "days" },
  { amount: 4.34524, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Number.POSITIVE_INFINITY, name: "years" },
] as const;

export const formatTimeAgo = (date: string) => {
  let duration = (+new Date(date) - +new Date()) / 1000;

  for (let i = 0; i < DIVISIONS.length; i++) {
    const division = DIVISIONS[i];
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }
};
