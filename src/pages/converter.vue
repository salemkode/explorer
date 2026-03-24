<template>
	<div class="container py-4 converter-page">
		<div class="card p-4">
			<h3 class="mb-2">{{ $t("converter_page_header") }}</h3>
			<p class="text-body-secondary mb-3">
				{{ $t("converter_page_subtext") }}
			</p>

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

const stateStore = useStateStore();
const inputAddress = ref("");

const trimmedInputAddress = computed(() => inputAddress.value.trim());

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
