<template>
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
		<!-- Diagnostic Form Card -->
		<div class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs transition-colors">
			<div class="mb-4">
				<div class="flex items-center gap-2 mb-1.5">
					<span class="w-2 h-2 rounded-full bg-emerald-500" />
					<h1 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
						BCMR Doctor
					</h1>
				</div>
				<p class="text-sm text-slate-500 dark:text-zinc-400">
					Enter a token ID to inspect the latest BCMR auth-chain publication, JSON schema validity, and metadata hash integrity.
				</p>
			</div>

			<form class="space-y-4" @submit.prevent="submit">
				<div>
					<label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2" for="doctor-token-id">
						Token Category ID
					</label>
					<input
						id="doctor-token-id"
						v-model="inputTokenId"
						type="text"
						class="w-full rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 py-3 px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
						placeholder="64-character token ID"
						autocomplete="off"
						spellcheck="false"
					/>
					<div v-if="hasInvalidInput" class="text-xs text-rose-500 font-medium mt-1.5">
						Token ID must be a 64-character hexadecimal string.
					</div>
				</div>

				<div class="flex items-center gap-2 pt-1">
					<button
						class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
						type="submit"
					>
						Diagnose
					</button>
					<button
						v-if="route.query.token"
						class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold text-sm transition-colors cursor-pointer"
						type="button"
						@click="clear"
					>
						Clear
					</button>
				</div>
			</form>
		</div>

		<!-- Diagnostic Results Card -->
		<div v-if="activeTokenId" class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs transition-colors">
			<LoadingSpinner v-if="loading" class="py-12" />

			<template v-else>
				<h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">
					Diagnostic Result
				</h2>

				<!-- Token Not Found -->
				<div v-if="diagnosis?.status === 'token-not-found'" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400">
					Token ID was not found on the selected network.
				</div>

				<!-- AuthChain Not Found -->
				<div
					v-else-if="diagnosis?.status === 'authchain-not-found'"
					class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400"
				>
					Token found, but no BCMR auth-chain publication was found.
				</div>

				<!-- Invalid OP_RETURN -->
				<div
					v-else-if="diagnosis?.status === 'invalid-opreturn'"
					class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400"
				>
					{{ diagnosis.error }}
				</div>

				<div
					v-else-if="
						diagnosis?.status === 'fetch-error' ||
						diagnosis?.status === 'json-parse-error' ||
						diagnosis?.status === 'ok'
					"
					class="space-y-6"
				>
					<!-- Status Cards Grid -->
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
						<div class="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40">
							<div class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
								JSON Schema
							</div>
							<div>
								<span
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
									:class="
										diagnosisWithSchema?.schemaValid
											? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
											: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
									"
								>
									{{ diagnosisWithSchema?.schemaValid ? "Valid" : "Issues Found" }}
								</span>
							</div>
						</div>

						<div v-if="diagnosisWithHash" class="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40">
							<div class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
								Metadata Hash
							</div>
							<div>
								<span
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
									:class="
										diagnosisWithHash.hashMatches
											? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
											: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
									"
								>
									{{ diagnosisWithHash.hashMatches ? "Matches" : "Mismatch" }}
								</span>
							</div>
						</div>

						<div v-if="diagnosisWithSchema" class="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40">
							<div class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
								Registry Entry
							</div>
							<div>
								<span
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
									:class="
										diagnosisWithSchema.tokenFoundInRegistry
											? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
											: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
									"
								>
									{{ diagnosisWithSchema.tokenFoundInRegistry ? "Found" : "Missing" }}
								</span>
							</div>
						</div>
					</div>

					<!-- Details List -->
					<div class="space-y-3">
						<div class="p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/30 dark:bg-zinc-800/20">
							<div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">Token ID</div>
							<code class="block text-xs font-mono text-slate-800 dark:text-zinc-200 break-all">{{ activeTokenId }}</code>
						</div>

						<div class="p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/30 dark:bg-zinc-800/20">
							<div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">Registry URL</div>
							<a :href="diagnosis.registryUrl" target="_blank" rel="noreferrer" class="text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline break-all">
								{{ diagnosis.registryUrl }} ↗
							</a>
						</div>

						<div class="p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/30 dark:bg-zinc-800/20">
							<div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">Expected Hash</div>
							<code class="block text-xs font-mono text-slate-800 dark:text-zinc-200 break-all">{{ diagnosis.expectedHash }}</code>
						</div>

						<div v-if="diagnosisWithHash" class="p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/30 dark:bg-zinc-800/20">
							<div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">Actual Hash</div>
							<code class="block text-xs font-mono text-slate-800 dark:text-zinc-200 break-all">{{ diagnosisWithHash.actualHash }}</code>
						</div>

						<div
							v-if="diagnosisWithHash && !diagnosisWithHash.hashMatches"
							class="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20"
						>
							<div class="text-[11px] font-semibold uppercase tracking-wider text-rose-500 mb-1">Correct Hash Required</div>
							<code class="block text-xs font-mono text-rose-600 dark:text-rose-400 break-all">{{ diagnosisWithHash.actualHash }}</code>
						</div>

						<div class="p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/30 dark:bg-zinc-800/20">
							<div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">BCMR OP_RETURN</div>
							<code class="block text-xs font-mono text-slate-800 dark:text-zinc-200 break-all">{{ diagnosis.opReturnHex }}</code>
						</div>
					</div>

					<!-- Error States -->
					<div
						v-if="diagnosis.status === 'json-parse-error'"
						class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400"
					>
						JSON parse error: {{ diagnosis.error }}
					</div>

					<div v-else-if="diagnosisWithSchema && !diagnosisWithSchema.schemaValid" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400">
						<ul class="space-y-1">
							<li v-for="(issue, index) in schemaIssues" :key="`${issue.path}-${index}`">
								<code class="font-mono">{{ issue.path }}</code>: {{ issue.message }}
							</li>
						</ul>
					</div>

					<div v-else-if="diagnosisWithSchema?.schemaValid" class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
						Registry JSON passes the BCMR schema specification.
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { GetAuthChains } from "~/module/chaingraph";
import { diagnoseRegistryFromAuthChain } from "~/module/doctor";
import { useStateStore } from "~/store";

const route = useRoute();
const router = useRouter();
const stateStore = useStateStore();

const routeTokenId = computed(() => {
	const token = route.query.token;
	return typeof token === "string" ? token.trim().toLowerCase() : "";
});

const inputTokenId = ref(routeTokenId.value);

watch(routeTokenId, (value) => {
	inputTokenId.value = value;
});

const tokenIdPattern = /^[a-f0-9]{64}$/i;
const normalizedInputTokenId = computed(() =>
	inputTokenId.value.trim().toLowerCase(),
);
const hasInvalidInput = computed(
	() =>
		!!normalizedInputTokenId.value &&
		!tokenIdPattern.test(normalizedInputTokenId.value),
);

const activeTokenId = computed(() =>
	tokenIdPattern.test(routeTokenId.value) ? routeTokenId.value : "",
);

const authChainVariables = computed(() => ({
	network: stateStore.network,
	tokenCategory: activeTokenId.value
		? [`\\x${activeTokenId.value}` as const]
		: [],
}));

const { result, loading } = useQuery(GetAuthChains, authChainVariables, () => ({
	enabled: !!activeTokenId.value,
}));

const diagnosis =
	ref<Awaited<ReturnType<typeof diagnoseRegistryFromAuthChain>>>();

const diagnosisWithHash = computed(() => {
	if (
		diagnosis.value?.status === "ok" ||
		diagnosis.value?.status === "json-parse-error"
	) {
		return diagnosis.value;
	}
});

const diagnosisWithSchema = computed(() => {
	if (diagnosis.value?.status === "ok") {
		return diagnosis.value;
	}
});

watch(
	() => [result.value, activeTokenId.value] as const,
	async ([authChain, tokenId]) => {
		if (!tokenId) {
			diagnosis.value = undefined;
			return;
		}

		if (!authChain) {
			return;
		}

		diagnosis.value = await diagnoseRegistryFromAuthChain(authChain, tokenId);
	},
	{
		immediate: true,
	},
);

const schemaIssues = computed(() => {
	if (!diagnosisWithSchema.value) {
		return [];
	}

	return diagnosisWithSchema.value.schemaErrors.map((issue) => ({
		path: issue.instancePath || issue.schemaPath || "/",
		message: issue.message || "Invalid value",
	}));
});

const submit = async () => {
	if (hasInvalidInput.value || !normalizedInputTokenId.value) {
		return;
	}

	await router.push({
		query: {
			...route.query,
			token: normalizedInputTokenId.value,
		},
	});
};

const clear = async () => {
	inputTokenId.value = "";
	diagnosis.value = undefined;

	const query = {
		...route.query,
		token: undefined,
	};

	await router.push({
		query,
	});
};
</script>
