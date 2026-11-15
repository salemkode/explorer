import {
	authenticationInstructionsAreMalformed,
	authenticationInstructionsArePushInstructions,
	base58AddressToLockingBytecode,
	binToHex,
	binToUtf8,
	cashAddressToLockingBytecode,
	decodeAuthenticationInstructions,
	decodeBase58Address,
	decodeCashAddress,
	decodeCashAddressFormatWithoutPrefix,
	hexToBin,
	isHex,
} from "@bitauth/libauth";
import BigNumber from "bignumber.js";
import type { bigNum } from "~/types";
import { getHttpsUrl } from "./utils";

// Keep invalid amount inputs on the existing NaN-to-zero path in BigNumber 11.
const Decimal = BigNumber.clone({ STRICT: false });

export const calculateDecimal = (num: bigNum, decimal: number) => {
	const bigNum = Decimal(num);
	if (bigNum.isNaN()) return BigNumber("0");
	return bigNum.shiftedBy(-decimal);
};

export const satToBch = (num: bigNum, decimalPlaces = 6) => {
	const sat = calculateDecimal(num, 8);
	return sat.decimalPlaces(decimalPlaces).toString();
};

export const removeAddressPrefix = (address: string) => {
	const regex = /(bitcoincash|bchtest):?([a-z0-9]{1,})/i;
	const simplifiedAddress = address.match(regex);

	if (simplifiedAddress?.[2]) {
		return simplifiedAddress[2];
	}
	return address;
};

export const getCashPrefix = (address: string) => {
	const separator = address.indexOf(":");
	if (separator === -1) {
		const decodeCashAddress = decodeCashAddressFormatWithoutPrefix(address);
		if (typeof decodeCashAddress !== "object")
			throw new Error("This Address not valid");
		return decodeCashAddress.prefix;
	}
	return address.slice(0, separator);
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

export const parseBinary = (opReturn: Uint8Array) => {
	if (opReturn[0] !== 0x6a) return [];
	const instructions = decodeAuthenticationInstructions(opReturn.slice(1));
	if (authenticationInstructionsAreMalformed(instructions)) return [];
	if (!authenticationInstructionsArePushInstructions(instructions)) return [];
	return instructions.map(({ data }) => data);
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
	if (!isHex(opReturnHex)) return "Invalid BCMR OP_RETURN";
	const chunks = parseBinary(hexToBin(opReturnHex));
	const [protocol, content, location] = chunks;

	if (!protocol || binToUtf8(protocol) !== "BCMR" || !content?.length) {
		return "Invalid BCMR OP_RETURN";
	}

	if (chunks.length === 2) {
		// IPFS Publication Output
		return {
			contentHash: binToHex(content),
			url: `https://dweb.link/ipfs/${binToUtf8(content)}`,
		};
	}

	if (!location?.length || content.length !== 32) {
		return "Invalid BCMR OP_RETURN";
	}
	try {
		return {
			// Content hash is in OP_SHA256 byte order per spec.
			contentHash: binToHex(content),
			url: normalizeMetadataUrl(binToUtf8(location)),
		};
	} catch {
		return "Invalid BCMR OP_RETURN";
	}
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
