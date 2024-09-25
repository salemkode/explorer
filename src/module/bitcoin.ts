import {
	base58AddressToLockingBytecode,
	binToHex,
	binToNumberUint16LE,
	binToUtf8,
	cashAddressToLockingBytecode,
	decodeBase58Address,
	decodeCashAddress,
	decodeCashAddressFormatWithoutPrefix,
	hexToBin,
} from "@bitauth/libauth";
import BigNumber from "bignumber.js";
import type { bigNum } from "~/types";
import { getHttpsUrl } from "./utils";

export const calculateDecimal = (num: bigNum, decimal: number) => {
	const bigNum = BigNumber(num);
	if (bigNum.isNaN()) return BigNumber("0");
	return bigNum.div(10 ** decimal);
};

export const satToBch = (num: bigNum, decimalPlaces = 6) => {
	const sat = calculateDecimal(num, 8);
	return sat.decimalPlaces(decimalPlaces).toString();
};

export const removeAddressPrefix = (address: string) => {
	const regex = /(bitcoincash|bchtest):?([a-z0-9]{1,})/i;
	const simplifiedAddress = address.match(regex);

	if (simplifiedAddress) {
		return simplifiedAddress[2];
	}
	return address;
};

export const getCashPrefix = (Address: string) => {
	if (Address.split(":").length === 1) {
		const decodeCashAddress = decodeCashAddressFormatWithoutPrefix(Address);
		if (typeof decodeCashAddress !== "object")
			throw new Error("This Address not valid");
		return decodeCashAddress.prefix;
	}
	return Address.split(":")[0];
};

export const addPrefixToAddress = (address: string) => {
	const prefix = getCashPrefix(address);
	return `${prefix}:${removeAddressPrefix(address)}`;
};

export const getAddressType = (address: string) => {
	const decodedAddress = decodeCashAddress(addPrefixToAddress(address));

	if (typeof decodedAddress === "object") {
		switch (decodedAddress.type) {
			case "p2pkh":
			case "p2pkhWithTokens":
				return "P2PKH";
			case "p2sh":
			case "p2shWithTokens":
				return "P2SH";
			default:
				return "Unknown";
		}
	}
};

export const addressToLockingBytecodeHex = (address: string) => {
	// Create lockingByte of legacy address
	const base58AddressLockingBytecode = base58AddressToLockingBytecode(address);
	if (typeof base58AddressLockingBytecode !== "string") {
		return binToHex(base58AddressLockingBytecode.bytecode);
	}

	// Create lockingByte of cash address
	const prefixAddress = addPrefixToAddress(address);
	const cashLockingBytecode = cashAddressToLockingBytecode(prefixAddress || "");
	if (typeof cashLockingBytecode !== "string") {
		return binToHex(cashLockingBytecode.bytecode);
	}
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

const validateBCMR = (chunks: Uint8Array[]) => {
	if (binToUtf8(chunks[0]) === "BCMR") {
		return;
	}
	return "Invalid BCMR OP_RETURN";
};

export const normalizeMetadataUrl = (urlContent: string) => {
	if (urlContent.startsWith("ipfs://")) return getHttpsUrl(urlContent);
	if (urlContent.startsWith("https://") || urlContent.startsWith("http://"))
		return urlContent;

	const urlObj = new URL(`https://${urlContent}`);
	if (urlObj.pathname === "/")
		urlObj.pathname = "/.well-known/bitcoin-cash-metadata-registry.json";
	return urlObj.toString();
};
export const opreturnToAuthChainElement = (opReturnHex: string) => {
	const chunks = parseBinary(hexToBin(opReturnHex));
	const result = {
		contentHash: "",
		url: "",
	};

	if (validateBCMR(chunks)) {
		return "Invalid BCMR OP_RETURN";
	}

	if (chunks.length === 2) {
		// IPFS Publication Output
		result.contentHash = binToHex(chunks[1]);
		const ipfsCid = binToUtf8(chunks[1]);
		result.url = `https://dweb.link/ipfs/${ipfsCid}`;
	} else {
		// HTTPS Publication Output
		// content hash is in OP_SHA256 byte order per spec
		const urlContent = binToUtf8(chunks[2]);
		result.contentHash = binToHex(chunks[1].slice());
		result.url = normalizeMetadataUrl(urlContent);
	}

	return result;
};

export const getTokenInfoType = (
	genesisSupply: number,
	totalSupplyNFTs: number,
) => {
	const isFungible = genesisSupply > 0;
	const isNFT = totalSupplyNFTs > 0;
	switch (true) {
		case isFungible && !isNFT:
			return "Fungible Tokens only";
		case !isFungible && isNFT:
			return "NFTs only";
		case isFungible && isNFT:
			return "Both Fungible & Non-Fungible tokens";
		default:
			return "Unknown type";
	}
};
