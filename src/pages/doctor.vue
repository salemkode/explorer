<template>
	<div class="container py-4 doctor-page">
		<div class="card p-4">
			<h3 class="mb-2">Doctor</h3>
			<p class="text-body-secondary mb-3">
				Enter a token ID to inspect the latest BCMR auth-chain publication, JSON
				schema issues, and metadata hash mismatches.
			</p>

			<form class="d-grid gap-3" @submit.prevent="submit">
				<div>
					<label class="form-label" for="doctor-token-id">Token ID</label>
					<input
						id="doctor-token-id"
						v-model="inputTokenId"
						type="text"
						class="form-control"
						placeholder="64-character token ID"
						autocomplete="off"
						spellcheck="false"
					/>
					<div v-if="hasInvalidInput" class="text-danger mt-2">
						Token ID must be a 64-character hexadecimal string.
					</div>
				</div>

				<div class="d-flex gap-2">
					<button class="btn btn-dark px-4" type="submit">Diagnose</button>
					<button
						v-if="route.query.token"
						class="btn btn-outline-secondary"
						type="button"
						@click="clear"
					>
						Clear
					</button>
				</div>
			</form>
		</div>

		<div v-if="activeTokenId" class="card p-4 mt-3">
			<LoadingSpinner v-if="loading" />

			<template v-else>
				<h5 class="mb-3">Result</h5>

				<div v-if="diagnosis?.status === 'token-not-found'" class="alert alert-danger mb-0">
					Token ID was not found on the selected network.
				</div>

				<div
					v-else-if="diagnosis?.status === 'authchain-not-found'"
					class="alert alert-warning mb-0"
				>
					Token found, but no BCMR auth-chain publication was found.
				</div>

				<div
					v-else-if="diagnosis?.status === 'invalid-opreturn'"
					class="alert alert-danger mb-0"
				>
					{{ diagnosis.error }}
				</div>

				<div
					v-else-if="
						diagnosis?.status === 'fetch-error' ||
						diagnosis?.status === 'json-parse-error' ||
						diagnosis?.status === 'ok'
					"
					class="d-grid gap-3"
				>
					<div class="status-grid">
						<div class="status-card">
							<div class="text-body-secondary small mb-1">JSON schema</div>
							<div
								:class="
									diagnosisWithSchema?.schemaValid
										? 'text-success'
										: 'text-danger'
								"
							>
								{{
									diagnosisWithSchema?.schemaValid
										? "Valid"
										: "Issues found"
								}}
							</div>
						</div>

						<div v-if="diagnosisWithHash" class="status-card">
							<div class="text-body-secondary small mb-1">Metadata hash</div>
							<div
								:class="
									diagnosisWithHash.hashMatches ? 'text-success' : 'text-danger'
								"
							>
								{{ diagnosisWithHash.hashMatches ? "Matches" : "Mismatch" }}
							</div>
						</div>

						<div v-if="diagnosisWithSchema" class="status-card">
							<div class="text-body-secondary small mb-1">Token in registry</div>
							<div
								:class="
									diagnosisWithSchema.tokenFoundInRegistry
										? 'text-success'
										: 'text-warning'
								"
							>
								{{ diagnosisWithSchema.tokenFoundInRegistry ? "Found" : "Missing" }}
							</div>
						</div>
					</div>

					<div class="detail-list">
						<div class="detail-item">
							<div class="text-body-secondary small">Token ID</div>
							<code class="detail-text">{{ activeTokenId }}</code>
						</div>
						<div class="detail-item">
							<div class="text-body-secondary small">Registry URL</div>
							<a :href="diagnosis.registryUrl" target="_blank" rel="noreferrer">
								{{ diagnosis.registryUrl }}
							</a>
						</div>
						<div class="detail-item">
							<div class="text-body-secondary small">Expected hash</div>
							<code class="detail-text">{{ diagnosis.expectedHash }}</code>
						</div>
						<div v-if="diagnosisWithHash" class="detail-item">
							<div class="text-body-secondary small">Actual hash</div>
							<code class="detail-text">{{ diagnosisWithHash.actualHash }}</code>
						</div>
						<div
							v-if="diagnosisWithHash && !diagnosisWithHash.hashMatches"
							class="detail-item"
						>
							<div class="text-body-secondary small">Correct hash</div>
							<code class="detail-text text-danger">{{
								diagnosisWithHash.actualHash
							}}</code>
						</div>
						<div class="detail-item">
							<div class="text-body-secondary small">BCMR OP_RETURN</div>
							<code class="detail-text">{{ diagnosis.opReturnHex }}</code>
						</div>
					</div>

					<div
						v-if="diagnosis.status === 'json-parse-error'"
						class="alert alert-danger mb-0"
					>
						JSON parse error: {{ diagnosis.error }}
					</div>

					<div v-else-if="diagnosisWithSchema && !diagnosisWithSchema.schemaValid" class="alert alert-danger mb-0">
						<ul class="mb-0 ps-3">
							<li v-for="(issue, index) in schemaIssues" :key="`${issue.path}-${index}`">
								<code>{{ issue.path }}</code> {{ issue.message }}
							</li>
						</ul>
					</div>

					<div v-else-if="diagnosisWithSchema?.schemaValid" class="alert alert-success mb-0">
						Registry JSON passes the BCMR schema.
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

<style scoped>
.doctor-page {
	max-width: 980px;
}

.status-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	gap: 12px;
}

.status-card,
.detail-item {
	border: 1px solid rgba(var(--bs-body-color-rgb), 0.12);
	border-radius: 12px;
	padding: 12px 14px;
}

.detail-list {
	display: grid;
	gap: 12px;
}

.detail-text {
	display: block;
	margin-top: 4px;
	overflow-wrap: anywhere;
	white-space: pre-wrap;
}
</style>
