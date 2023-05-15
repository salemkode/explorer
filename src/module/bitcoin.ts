import BigNumber from "bignumber.js";
import {
  base58AddressToLockingBytecode,
  cashAddressToLockingBytecode,
  decodeCashAddressFormatWithoutPrefix,
  decodeCashAddress,
  decodeBase58Address,
  binToHex,
  binToNumberUint16LE,
} from "@bitauth/libauth";
import type { bigNum } from "~/types";

export const calculateDecimal = (num: bigNum, decimal: number) => {
  const bigNum = BigNumber(num);
  if (bigNum.isNaN()) return BigNumber("0");
  return bigNum.div(Math.pow(10, decimal));
};

export const satToBch = (num: bigNum, decimalPlaces = 6) => {
  const sat = calculateDecimal(num, 8);
  return sat.decimalPlaces(decimalPlaces).toString();
};

export const removeAddressPrefix = (address: string) => {
  const regex = /(bitcoincash|bchtest):?([a-z0-9]{42})/i;
  const simplifiedAddress = address.match(regex);

  if (simplifiedAddress) {
    return simplifiedAddress[2];
  }
  return address;
};

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
