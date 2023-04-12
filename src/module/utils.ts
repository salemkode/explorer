import BigNumber from "bignumber.js";
import {
  base58AddressToLockingBytecode,
  cashAddressToLockingBytecode,
  decodeCashAddressFormatWithoutPrefix,
  hexToBin,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
import { binToHex } from "mainnet-js";

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

export function lockingBytecodeHexToCashAddress(
  hexCode: string,
  prefix: "bchtest" | "bitcoincash" | "bchreg" = "bchtest",
  tokenSupport = true
) {
  const bytecode = hexToBin(hexCode);
  const address = lockingBytecodeToCashAddress(bytecode, prefix, {
    tokenSupport,
  });

  return typeof address === "string" ? address : undefined;
}

export const removeAddressPrefix = (address: string) => {
  const regex = /(bitcoincash|bchtest):?([a-z0-9]{42})/i;
  const simplifiedAddress = address.match(regex);

  if (simplifiedAddress) {
    return simplifiedAddress[2];
  }
  return address;
};

export const shortTx = (text: string) =>
  `${text.slice(0, 8)}...${text.slice(-5)}`;

export const isServer = process.server;

export const addressToLockingBytecodeHex = (address: string) => {
  let lockingByteCode: Uint8Array | undefined;

  const base58AddressLockingBytecode = base58AddressToLockingBytecode(address);
  if (typeof base58AddressLockingBytecode !== "string") {
    lockingByteCode = base58AddressLockingBytecode.bytecode;
  } else {
    const decodeCashAddress = decodeCashAddressFormatWithoutPrefix(address);
    let prefixAddress: string | undefined;
    if (typeof decodeCashAddress === "object") {
      prefixAddress = `${decodeCashAddress.prefix}:${address}`;
    } else {
      prefixAddress = address;
    }
    const cashLockingBytecode = cashAddressToLockingBytecode(
      prefixAddress || ""
    );
    if (typeof cashLockingBytecode !== "string") {
      lockingByteCode = cashLockingBytecode.bytecode;
    }
  }

  return lockingByteCode ? binToHex(lockingByteCode) : undefined;
};
