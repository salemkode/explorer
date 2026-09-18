<template>
	<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs transition-colors space-y-6">
			<!-- Header -->
			<div>
				<div class="flex items-center gap-2.5 mb-2">
					<h1 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
						{{ $t("converter_page_header") }}
					</h1>
					<span v-if="showAlpha" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
						{{ $t("converter_alpha_badge") }}
					</span>
				</div>
				<p class="text-sm text-slate-500 dark:text-zinc-400">
					{{ $t("converter_page_subtext") }}
				</p>
			</div>

			<!-- Alpha Warning -->
			<div v-if="showAlpha" class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-1 leading-relaxed">
				<div class="font-bold">{{ $t("converter_alpha_warning_title") }}</div>
				<div>{{ $t("converter_alpha_warning_body") }}</div>
			</div>

			<!-- Input -->
			<div>
				<label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
					Address to Convert
				</label>
				<input
					v-model="inputAddress"
					type="text"
					class="w-full rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 py-3.5 px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
					:placeholder="$t('converter_input_placeholder')"
				/>

				<div v-if="hasInvalidInput" class="text-xs text-rose-500 font-medium mt-2">
					{{ $t("converter_invalid_address") }}
				</div>

				<div v-else-if="addressType" class="mt-3 flex items-center gap-2">
					<span class="text-xs text-slate-500 dark:text-zinc-400">
						{{ $t("converter_detected_type") }}:
					</span>
					<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
						{{ addressType }}
					</span>
				</div>
			</div>

			<!-- Converted Outputs -->
			<ContentWarp
				v-if="addressInfoWarp.length"
				:loading="false"
				:items="addressInfoWarp"
			/>

			<div v-if="crossCheckMismatches.length" class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
				Cross-check mismatch for: {{ crossCheckMismatches.join(", ") }}. Please verify with the external tools below.
			</div>

			<hr class="border-slate-100 dark:border-zinc-800" />

			<!-- External Verification -->
			<div>
				<h5 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
					{{ $t("converter_verify_header") }}
				</h5>
				<p class="text-xs text-slate-500 dark:text-zinc-400 mb-3">
					{{ $t("converter_verify_subtext") }}
				</p>
				<ul class="space-y-2">
					<li>
						<a
							href="https://bch.info/en/tools/cashaddr"
							target="_blank"
							rel="noopener noreferrer"
							class="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
						>
							<span>bch.info — Address conversion tool</span>
							<span class="text-xs">↗</span>
						</a>
					</li>
					<li>
						<a
							href="https://www.bitcoin.com/tools/cash-address-converter/"
							target="_blank"
							rel="noopener noreferrer"
							class="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
						>
							<span>Bitcoin.com — Cash Address Converter</span>
							<span class="text-xs">↗</span>
						</a>
					</li>
					<li>
						<a
							href="https://cashaddr.bitcoincash.org/"
							target="_blank"
							rel="noopener noreferrer"
							class="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
						>
							<span>bitcoincash.org — CashAddr tool</span>
							<span class="text-xs">↗</span>
						</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	hexToBin,
	lockingBytecodeToBase58Address,
	lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
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

const cashAddressLibauth = computed(() => {
	if (!lockingBytecode.value) return;
	const prefix = stateStore.network === "mainnet" ? "bitcoincash" : "bchtest";
	const address = lockingBytecodeToCashAddress(
		hexToBin(lockingBytecode.value),
		prefix,
		{ tokenSupport: false },
	);
	return typeof address === "string" ? address : undefined;
});

const tokenAddressLibauth = computed(() => {
	if (!lockingBytecode.value) return;
	const prefix = stateStore.network === "mainnet" ? "bitcoincash" : "bchtest";
	const address = lockingBytecodeToCashAddress(
		hexToBin(lockingBytecode.value),
		prefix,
		{ tokenSupport: true },
	);
	return typeof address === "string" ? address : undefined;
});

const crossCheckMismatches = computed(() => {
	const mismatches: string[] = [];
	if (
		cashAddress.value &&
		cashAddressLibauth.value &&
		cashAddress.value !== cashAddressLibauth.value
	) {
		mismatches.push("Cash Address");
	}
	if (
		tokenAddress.value &&
		tokenAddressLibauth.value &&
		tokenAddress.value !== tokenAddressLibauth.value
	) {
		mismatches.push("Token Address");
	}
	return mismatches;
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
