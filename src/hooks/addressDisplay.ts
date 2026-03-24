import { useStorage } from "~/hooks/storage";
import {
	addPrefixToAddress,
	addressToLockingBytecodeHex,
	removeAddressPrefix,
} from "~/module/bitcoin";
import { useStateStore } from "~/store";

export type AddressDisplayMode = "token" | "regular";

export const addressDisplayMode = useStorage<AddressDisplayMode>(
	"addressDisplayMode",
	"token",
);

type AddressFormatOptions = {
	removePrefix?: boolean;
};

const withDefaultOptions = (opts?: AddressFormatOptions) => ({
	removePrefix: opts?.removePrefix ?? true,
});

export const formatLockingBytecodeAddress = (
	lockingBytecodeHex: string,
	opts?: AddressFormatOptions,
) => {
	const stateStore = useStateStore();
	const tokenSupport = addressDisplayMode.value === "token";
	const address = stateStore.lockingBytecodeHexToCashAddress(
		lockingBytecodeHex,
		tokenSupport,
	);

	if (typeof address !== "string") return;
	const options = withDefaultOptions(opts);
	return options.removePrefix ? removeAddressPrefix(address) : address;
};

export const normalizeDisplayAddress = (
	address: string,
	opts?: AddressFormatOptions,
) => {
	const options = withDefaultOptions(opts);
	const lockingBytecodeHex = addressToLockingBytecodeHex(address);

	if (lockingBytecodeHex) {
		const convertedAddress = formatLockingBytecodeAddress(
			lockingBytecodeHex,
			options,
		);
		if (typeof convertedAddress === "string") {
			return convertedAddress;
		}
	}

	if (options.removePrefix) {
		return removeAddressPrefix(address);
	}

	return addPrefixToAddress(address);
};
