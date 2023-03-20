import {
  hexToBin,
  lockingBytecodeToCashAddress,
  parseScript,
  sha256,
  ripemd160,
  encodeCashAddress,
} from "@bitauth/libauth";
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

export function lockingBytecodeHexToCashAddress(hexCode: string) {
  const bytecode = hexToBin(hexCode);
  return lockingBytecodeToCashAddress(bytecode, "bchtest", {
    tokenSupport: true,
  });
}

export const scriptSigToCashAddress = (unlocking_bytecode: string) => {
  const parsed = parseScript(unlocking_bytecode);
  if (parsed.status === true && parsed?.value?.value[1]) {
    const publicKey = parsed.value.value[1]?.value as string;
    return encodeCashAddress(
      "bchtest",
      "p2pkhWithTokens",
      ripemd160.hash(sha256.hash(hexToBin(publicKey)))
    );
  } else {
    return {
      status: false,
    };
  }
};

export const removeAddressPrefix = (address: string) => {
  const regex = /(bitcoincash|bchreg|bchtest):?([q|p][a-z0-9]{41})/i;
  const simplifiedAddress = address.match(regex);

  if (simplifiedAddress) {
    return simplifiedAddress[2];
  }
  return address;
};

export const shortTx = (text: string) =>
  `${text.slice(0, 8)}...${text.slice(-5)}`;

export const getTokenType = (
  genesisSupply: number,
  totalSupplyNFTs: number
) => {
  if (genesisSupply && !totalSupplyNFTs) {
    return "Fungible Tokens only";
  } else if (!genesisSupply && totalSupplyNFTs) {
    return "NFTs only";
  } else if (genesisSupply && totalSupplyNFTs) {
    return "Both Fungible & Non-Fungible tokens";
  } else {
    return "Unknown token type";
  }
};
