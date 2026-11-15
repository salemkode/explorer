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
				<label for="converter-address" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
					Address to convert
				</label>
				<input
					id="converter-address"
					v-model="inputAddress"
					type="text"
					class="w-full rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 py-3.5 px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
					:placeholder="$t('converter_input_placeholder')"
					autocomplete="off"
					autocapitalize="none"
					:spellcheck="false"
					:aria-invalid="conversion.status === 'invalid'"
					aria-describedby="converter-input-help converter-feedback"
				/>

				<p id="converter-input-help" class="mt-2 text-xs text-slate-500 dark:text-zinc-400">
					Paste a regular CashAddr, token-aware CashAddr, or legacy address. CashAddr prefixes are optional.
				</p>
				<div id="converter-feedback" aria-live="polite" class="mt-2 text-xs">
					<p v-if="conversion.status === 'invalid'" class="text-rose-600 dark:text-rose-400">
						{{ $t("converter_invalid_address") }}
					</p>
					<p v-else-if="conversion.status === 'ready'" class="text-emerald-700 dark:text-emerald-300">
						{{ conversion.addressType }} · {{ conversion.inputFormat }} · {{ conversion.inputNetwork }}
					</p>
					<p v-else class="text-slate-500 dark:text-zinc-400">Enter an address to see its equivalent formats.</p>
				</div>
			</div>

			<div>
				<label for="converter-network" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">Output network</label>
				<select id="converter-network" v-model="outputNetwork" aria-describedby="converter-network-help" class="w-full rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
					<option v-for="(network, value) in converterNetworks" :key="value" :value="value">{{ network.label }}</option>
				</select>
				<p id="converter-network-help" class="mt-2 text-xs text-slate-500 dark:text-zinc-400">
					This selection applies only to these converted outputs. Changing the encoding does not move funds between networks. Chipnet shares the testnet address format.
				</p>
			</div>

			<section v-if="conversion.status === 'ready'" class="space-y-4" aria-labelledby="converter-results-title">
				<h2 id="converter-results-title" class="text-sm font-semibold text-slate-900 dark:text-white">Equivalent addresses · {{ converterNetworks[outputNetwork].label }}</h2>
				<ConverterOutput
					:key="conversion.tokenAddress"
					id="converter-token"
					title="Token-aware address"
					description="For BCH and CashTokens in a token-supporting wallet. This format signals token support; it does not add it to a wallet."
					:address="conversion.tokenAddress"
				/>
				<ConverterOutput
					:key="conversion.regularAddress"
					id="converter-regular"
					title="Regular BCH address"
					description="For BCH payments. This format does not signal CashTokens support."
					:address="conversion.regularAddress"
				/>
				<ConverterOutput
					v-if="conversion.legacyAddress"
					:key="conversion.legacyAddress"
					id="converter-legacy"
					title="Legacy address"
					description="For BCH payments in older software. Use the token-aware address for CashTokens."
					:address="conversion.legacyAddress"
				/>
				<div v-else class="rounded-xl border border-slate-200 dark:border-zinc-700 p-4 space-y-2">
					<h3 class="text-sm font-semibold text-slate-900 dark:text-white">Legacy address unavailable</h3>
					<p class="text-xs text-slate-500 dark:text-zinc-400">P2SH32 has no legacy address format. Use a CashAddr output above with a wallet that supports P2SH32.</p>
				</div>
			</section>

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
import { convertAddress, converterNetworks } from "~/module/address-converter";
import { useStateStore } from "~/store";

const runtimeConfig = useRuntimeConfig();
const showAlpha = computed(
	() => runtimeConfig.public?.features?.converterAlpha === true,
);
const stateStore = useStateStore();
const inputAddress = ref("");
const outputNetwork = ref(stateStore.network);
const conversion = computed(() =>
	convertAddress(inputAddress.value, outputNetwork.value),
);

useHead(() => ({
	title: showAlpha.value ? "Address Converter (Alpha)" : "Address Converter",
}));
</script>
