import BigNumber from "bignumber.js";
import {
  base58AddressToLockingBytecode,
  cashAddressToLockingBytecode,
  decodeCashAddressFormatWithoutPrefix,
  decodeCashAddress,
  decodeBase58Address,
  hexToBin,
  lockingBytecodeToCashAddress,
  binToHex,
  binToNumberUint16LE,
} from "@bitauth/libauth";

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

export const isValidAddress = (address: string) => {
  // Check if it's a cash address with prefix
  const decodedCashAddress = decodeCashAddress(address);
  if (typeof decodedCashAddress === "object") {
    return true;
  }

  // Check if it's a cash address without prefix
  const decodedCashAddressWithoutPrefix =
    decodeCashAddressFormatWithoutPrefix(address);
  if (typeof decodedCashAddressWithoutPrefix === "object") {
    return true;
  }

  // Check if it's a base58 address
  const decodedBase58 = decodeBase58Address(address);
  if (typeof decodedBase58 === "object") {
    return true;
  }

  return false;
};

// This function is from mainnet-js
export const parseBinary = (opReturn: Uint8Array): Uint8Array[] => {
  const chunks: Uint8Array[] = [];
  let position = 1;

  // handle direct push, OP_PUSHDATA1, OP_PUSHDATA2;
  // OP_PUSHDATA4 is not supported in OP_RETURNs by consensus
  while (opReturn[position]) {
    let length = 0;
    if (opReturn[position] === 0x4c) {
      length = opReturn[position + 1];
      position += 2;
    } else if (opReturn[position] === 0x4d) {
      length = binToNumberUint16LE(opReturn.slice(position + 1, position + 3));
      position += 3;
    } else {
      length = opReturn[position];
      position += 1;
    }

    chunks.push(opReturn.slice(position, position + length));
    position += length;
  }

  return chunks;
};
