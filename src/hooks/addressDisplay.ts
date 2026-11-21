import {
	Base58AddressFormatVersion,
	base58AddressToLockingBytecode,
	cashAddressToLockingBytecode,
	lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
import { type InferOutput, picklist, safeParse } from "valibot";
import { useStorage } from "~/hooks/storage";
import {
	addPrefixToAddress,
	getAddressType,
	removeAddressPrefix,
} from "~/module/bitcoin";
import { useStateStore } from "~/store/state";
import type { Utxo } from "~/types";

const addressDisplayModeSchema = picklist(["auto", "token", "regular"]);
export type AddressDisplayMode = InferOutput<typeof addressDisplayModeSchema>;

export function useAddressDisplayPreference() {
	const mode = useStorage<AddressDisplayMode>("addressDisplayMode", "auto");
	// Older versions also stored raw strings. useStorage reads both forms;
	// validate here before a persisted value can control address encoding.
	const saved = safeParse(addressDisplayModeSchema, mode.value);
	mode.value = saved.success ? saved.output : "auto";
	return mode;
}

export const addressDisplayMode = useAddressDisplayPreference();

type AddressFormatOptions = {
	removePrefix?: boolean;
	tokenCategory?: Utxo["token_category"];
};

export function formatLockingBytecodeAddress(
	lockingBytecodeHex: string,
	opts?: AddressFormatOptions,
) {
	const tokenSupport = {
		auto: Boolean(opts?.tokenCategory),
		token: true,
		regular: false,
	}[addressDisplayMode.value];
	const address = useStateStore().lockingBytecodeHexToCashAddress(
		lockingBytecodeHex,
		tokenSupport,
	);

	if (!address) return;
	return opts?.removePrefix === false ? address : removeAddressPrefix(address);
}

// The input is a previous output (outpoint) for "from", or a new output for
// "to". Never infer token presence from the FT amount or address history.
export function formatUtxoAddress(
	utxo: Pick<Utxo, "locking_bytecode" | "token_category">,
) {
	const bytecode = utxo.locking_bytecode.startsWith("\\x")
		? utxo.locking_bytecode.substring(2)
		: utxo.locking_bytecode;
	const fullAddress = formatLockingBytecodeAddress(bytecode, {
		removePrefix: false,
		tokenCategory: utxo.token_category,
	});
	if (!fullAddress) return;
	const address = removeAddressPrefix(fullAddress);
	return {
		fullAddress,
		address,
		addressType: getAddressType(fullAddress),
		url: `/address/${address}`,
	};
}

export function normalizeDisplayAddress(
	address: string,
	opts?: Pick<AddressFormatOptions, "removePrefix">,
) {
	const legacy = base58AddressToLockingBytecode(address);
	const decoded =
		typeof legacy === "string"
			? cashAddressToLockingBytecode(addPrefixToAddress(address))
			: {
					bytecode: legacy.bytecode,
					prefix:
						legacy.version === Base58AddressFormatVersion.p2pkhTestnet ||
						legacy.version === Base58AddressFormatVersion.p2sh20Testnet
							? ("bchtest" as const)
							: ("bitcoincash" as const),
					tokenSupport: false,
				};
	if (typeof decoded === "string") return address;

	// An address page has no single UTXO. In auto mode preserve the incoming
	// encoding (including its network) so following a link retains QR semantics.
	const tokenSupport = {
		auto: decoded.tokenSupport,
		token: true,
		regular: false,
	}[addressDisplayMode.value];
	const encoded = lockingBytecodeToCashAddress({ ...decoded, tokenSupport });
	if (typeof encoded === "string") return address;
	return opts?.removePrefix === false
		? encoded.address
		: removeAddressPrefix(encoded.address);
}
