<template>
	<div class="container py-4 converter-page">
		<div class="card p-4">
			<div class="d-flex align-items-center gap-2 mb-2">
				<h3 class="mb-0">{{ $t("converter_page_header") }}</h3>
				<span v-if="showAlpha" class="badge text-bg-warning">
					{{ $t("converter_alpha_badge") }}
				</span>
			</div>
			<p class="text-body-secondary mb-3">
				{{ $t("converter_page_subtext") }}
			</p>

			<div v-if="showAlpha" class="alert alert-warning mb-3">
				<div class="fw-semibold">{{ $t("converter_alpha_warning_title") }}</div>
				<div>{{ $t("converter_alpha_warning_body") }}</div>
			</div>

			<input
				v-model="inputAddress"
				type="text"
				class="form-control"
				:placeholder="$t('converter_input_placeholder')"
			/>

			<div v-if="hasInvalidInput" class="text-danger mt-2">
				{{ $t("converter_invalid_address") }}
			</div>

			<div v-else-if="addressType" class="mt-3">
				<span class="text-body-secondary me-2">
					{{ $t("converter_detected_type") }}:
				</span>
				<span class="badge text-bg-primary">{{ addressType }}</span>
			</div>

			<ContentWarp
				v-if="addressInfoWarp.length"
				class="mt-3"
				:loading="false"
				:items="addressInfoWarp"
			/>

			<hr class="my-4" />

			<h5 class="mb-2">{{ $t("converter_verify_header") }}</h5>
			<p class="text-body-secondary mb-2">
				{{ $t("converter_verify_subtext") }}
			</p>
			<ul class="mb-0">
				<li>
					<a
						href="https://bch.info/en/tools/cashaddr"
						target="_blank"
						rel="noopener noreferrer"
					>
						bch.info — Address conversion tool
					</a>
				</li>
				<li>
					<a
						href="https://www.bitcoin.com/tools/cash-address-converter/"
						target="_blank"
						rel="noopener noreferrer"
					>
						Bitcoin.com — Cash Address Converter
					</a>
				</li>
				<li>
					<a
						href="https://cashaddr.bitcoincash.org/"
						target="_blank"
						rel="noopener noreferrer"
					>
						bitcoincash.org — CashAddr tool
					</a>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import { hexToBin, lockingBytecodeToBase58Address } from "@bitauth/libauth";
import {
	addressToLockingBytecodeHex,
	getAddressType,
	isValidAddress,
} from "~/module/bitcoin";
import { useStateStore } from "~/store";
import type { contentWarpItem } from "~/types";

const runtimeConfig = useRuntimeConfig();
const showAlpha = computed(
	() => runtimeConfig.public?.features?.converterAlpha === true,
);

const stateStore = useStateStore();
const inputAddress = ref("");

const trimmedInputAddress = computed(() => inputAddress.value.trim());

useHead(() => ({
	title: showAlpha.value ? "Address Converter (Alpha)" : "Address Converter",
}));

const lockingBytecode = computed(() => {
	if (
		!trimmedInputAddress.value ||
		!isValidAddress(trimmedInputAddress.value)
	) {
		return;
	}
	return addressToLockingBytecodeHex(trimmedInputAddress.value);
});

const hasInvalidInput = computed(
	() => !!trimmedInputAddress.value && !lockingBytecode.value,
);

const tokenAddress = computed(() => {
	if (!lockingBytecode.value) return;
	return stateStore.lockingBytecodeHexToCashAddress(
		lockingBytecode.value,
		true,
	);
});

const cashAddress = computed(() => {
	if (!lockingBytecode.value) return;
	return stateStore.lockingBytecodeHexToCashAddress(
		lockingBytecode.value,
		false,
	);
});

const legacyAddress = computed(() => {
	if (!lockingBytecode.value) return;
	const network = stateStore.network === "mainnet" ? "mainnet" : "testnet";
	const address = lockingBytecodeToBase58Address(
		hexToBin(lockingBytecode.value),
		network,
	);
	return typeof address === "string" ? address : undefined;
});

const addressType = computed(() => {
	if (!cashAddress.value) return;
	return getAddressType(cashAddress.value);
});

const addressInfoWarp = computed<contentWarpItem[]>(() => {
	if (hasInvalidInput.value || !lockingBytecode.value) return [];
	return [
		{
			title: "Token Address",
			text: tokenAddress.value,
			copy: true,
			warp: true,
		},
		{
			title: "Cash Address",
			text: cashAddress.value,
			copy: true,
			warp: true,
		},
		{
			title: "Legacy Address",
			text: legacyAddress.value,
			copy: true,
			warp: true,
		},
	];
});
</script>

<style scoped>
.converter-page {
	max-width: 900px;
}
</style>
