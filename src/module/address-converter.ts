import {
	Base58AddressFormatVersion,
	base58AddressToLockingBytecode,
	cashAddressToLockingBytecode,
	decodeCashAddressFormatWithoutPrefix,
	lockingBytecodeToAddressContents,
	lockingBytecodeToBase58Address,
	lockingBytecodeToCashAddress,
} from "@bitauth/libauth";

export const converterNetworks = {
	mainnet: { label: "Mainnet", prefix: "bitcoincash", legacy: "mainnet" },
	chipnet: { label: "Chipnet", prefix: "bchtest", legacy: "testnet" },
} as const;

function decodeConverterAddress(input: string) {
	const legacy = base58AddressToLockingBytecode(input);
	if (typeof legacy !== "string") {
		return {
			bytecode: legacy.bytecode,
			inputFormat: "Legacy",
			inputNetwork:
				legacy.version === Base58AddressFormatVersion.p2pkhTestnet ||
				legacy.version === Base58AddressFormatVersion.p2sh20Testnet
					? "Test networks"
					: "Mainnet",
		};
	}

	// CashAddr permits all-uppercase text, but not mixed case. Never lowercase
	// Base58 addresses: their case is part of the encoded payload.
	const lowercase = input.toLowerCase();
	if (input !== lowercase && input !== input.toUpperCase()) return;
	const prefixless = input.includes(":")
		? undefined
		: decodeCashAddressFormatWithoutPrefix(lowercase, [
				"bitcoincash",
				"bchtest",
			]);
	const address = input.includes(":")
		? lowercase
		: typeof prefixless === "object"
			? `${prefixless.prefix}:${lowercase}`
			: "";
	const cash = cashAddressToLockingBytecode(address);
	if (typeof cash === "string") return;
	if (cash.prefix !== "bitcoincash" && cash.prefix !== "bchtest") return;
	return {
		bytecode: cash.bytecode,
		inputFormat: cash.tokenSupport
			? "Token-aware CashAddr"
			: "Regular CashAddr",
		inputNetwork: cash.prefix === "bitcoincash" ? "Mainnet" : "Test networks",
	};
}

/** Convert locally using Libauth; the selected network controls every output. */
export function convertAddress(
	input: string,
	network: keyof typeof converterNetworks,
) {
	const trimmed = input.trim();
	if (!trimmed) return { status: "empty" as const };
	const decoded = decodeConverterAddress(trimmed);
	if (!decoded) return { status: "invalid" as const };
	const { bytecode, inputFormat, inputNetwork } = decoded;
	const { prefix, legacy } = converterNetworks[network];
	const regularAddress = lockingBytecodeToCashAddress({ bytecode, prefix });
	const tokenAddress = lockingBytecodeToCashAddress({
		bytecode,
		prefix,
		tokenSupport: true,
	});
	if (typeof regularAddress === "string" || typeof tokenAddress === "string") {
		return { status: "invalid" as const };
	}
	const legacyAddress = lockingBytecodeToBase58Address(bytecode, legacy);
	return {
		status: "ready" as const,
		inputFormat,
		inputNetwork,
		addressType: lockingBytecodeToAddressContents(bytecode).type,
		regularAddress: regularAddress.address,
		tokenAddress: tokenAddress.address,
		legacyAddress:
			typeof legacyAddress === "string" ? legacyAddress : undefined,
	};
}
