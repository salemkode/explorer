<template>
  <div class="w-full">
      <TokenAuthChains
        :chains="chains"
        :selection="selection"
        :metadata="selectedMetadata"
        :loading="authchainQueryLoading"
        :error="Boolean(authchainError)"
        @chain="selectChain"
        @revision="selectRevision"
        @reset="resetSelection"
        @retry="refetch()"
      />
    <p v-if="queryError" role="alert" class="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-rose-600 dark:text-rose-400">
      Token details could not be loaded. Check your connection and reload the page.
    </p>
    <LoadingView v-else-if="authchainLoading" />
    <div v-else-if="!authchainElement" class="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ authchain?.transaction.length ? "Token details unavailable" : "Token not found" }}</h1>
      <p class="text-sm text-slate-500 dark:text-zinc-400">No token genesis was found for this ID on the selected network.</p>
    </div>
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Mobile Header -->
      <TokenId
        :loading="metadata.loading"
        :identity-snapshot="metadata.identitySnapshot || null"
        :category="category"
        class="lg:hidden mb-4"
      />
      <NavPills
        v-model:select="navItem"
        :items="['token_register', 'transaction']"
        class="lg:hidden mb-6"
      />

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left Column: Registry & BCMR Info -->
        <div
          class="lg:col-span-4 space-y-6"
          :class="{
            'hidden lg:block': navItem === 1,
          }"
        >
          <content-warp
            v-if="tokenInfo"
            :items="tokenInfo"
            :loading="authchainLoading"
          />
          <bcmr-info
            :token-category="category"
            :loading="metadata.loading"
            :identity-snapshot="metadata.identitySnapshot"
          />
          <p v-if="metadata.loading" role="status" class="text-sm text-slate-500 dark:text-zinc-400">
            Loading token metadata…
          </p>
          <p v-else-if="!metadata.identitySnapshot" role="status" class="text-sm text-slate-500 dark:text-zinc-400">
            {{ metadata.failed ? 'Auth-chain metadata could not be loaded. You can choose another registry below.' : 'No token metadata is available from the selected registry.' }}
          </p>
          <TokenProvider
            :select="selectedRegistryName"
            :auth-metadata="selectedMetadata"
            :category="category"
            @select="(url) => (selectedRegistryName = url)"
          />
        </div>

        <!-- Right Column: Details & Children/NFTs/Transactions -->
        <div
          class="lg:col-span-8 space-y-6"
          :class="{
            'hidden lg:block': navItem === 0,
          }"
        >
          <TokenId
            :loading="metadata.loading"
            :identity-snapshot="metadata.identitySnapshot || null"
            :category="category"
            class="hidden lg:flex"
          />

          <NavPills
            v-if="hasNftCapability"
            v-model:select="tokenViewIndex"
            :items="['table_view', 'grid_view']"
          />

          <template v-if="effectiveTokenViewMode === 'table'">
            <TokenAddress
               :state="balanceState"
              :key="`${stateStore.network}:${category}:addresses`"
              :decimals="decimals"
            />
            <TokenTransaction :key="`${stateStore.network}:${category}:transactions`" :category="category" />
          </template>

          <TokenChild
            :key="`${stateStore.network}:${category}:children`"
            :identity-snapshot="metadata.identitySnapshot || null"
            :category="category"
            :view-mode="effectiveTokenViewMode"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatLockingBytecodeAddress } from "~/hooks/addressDisplay";
import { useAuthChainSelection } from "~/hooks/authChainSelection";
import { useAuthChains } from "~/hooks/authchains";
import { useConfirmedTokenBalances } from "~/hooks/confirmedTokenBalances";
import { useStorage } from "~/hooks/storage";
import { decodeAuthChain } from "~/module/bcmr";
import { calculateDecimal } from "~/module/bitcoin";
import { exactTokenAmount, summarizeTokenBalances } from "~/module/tokenBalances";
import { useRegistryStore, useStateStore } from "~/store";
import type { contentWarpItem } from "~/types";

const route = useRoute();
const category = computed(() =>
	typeof route.params.category === "string" ? route.params.category : "",
);
const router = useRouter();

const stateStore = useStateStore();
const registryStore = useRegistryStore();
const tokenCategory = computed(() => `\\x${category.value}` as const);
const navItem = ref(0);
const {
	result: authchain,
	loading: authchainQueryLoading,
	error: authchainError,
	refetch,
} = useAuthChains(toRef(() => [`\\x${category.value}` as const]), false);

const { chains, selection, metadata: selectedMetadata } = useAuthChainSelection(
	authchain,
	category,
	toRef(() => typeof route.query.chain === "string" ? route.query.chain : undefined),
	toRef(() => typeof route.query.revision === "string" ? route.query.revision : undefined),
);
function selectChain(id: string) {
	return router.push({ query: { ...route.query, chain: id, revision: undefined } });
}
function selectRevision(id: string) {
	return router.push({ query: { ...route.query, chain: selection.value.chain?.id, revision: id } });
}
function resetSelection() {
	return router.push({ query: { ...route.query, chain: undefined, revision: undefined } });
}

const authchainElement = computed(
	() => authchain.value && selection.value.chain && selection.value.revision &&
		decodeAuthChain(authchain.value, category.value, selection.value.chain.id, selection.value.revision.id),
);
const reservedSupply = computed(() => selection.value.chain?.reservedSupply);
const queryError = authchainError;
const selectedRegistryName = ref("auth_chain");
watch(
	() => [category.value, stateStore.network],
	() => {
		selectedRegistryName.value = "auth_chain";
		navItem.value = 0;
	},
	{ flush: "sync" },
);
const balanceScope = computed(() => ({
	network: stateStore.network,
	filter: { token_category: { _eq: `\\x${category.value}` as const } },
}));
const { state: balanceState, refresh: refreshBalances } =
	useConfirmedTokenBalances(balanceScope);
const totals = computed(() =>
	balanceState.value.status === "ready"
		? summarizeTokenBalances(balanceState.value.outputs)
		: undefined,
);
// Genesis totals include outputs that have since been spent. Page them independently
// rather than trusting a potentially truncated nested authchain output list.
const genesisScope = computed(() => {
	const hash = authchainElement.value?.genesesTx.hash;
	return hash
		? {
				network: stateStore.network,
				includeSpent: true,
				filter: {
					token_category: { _eq: `\\x${category.value}` as const },
					transaction_hash: { _eq: `\\x${hash}` as const },
				},
			}
		: null;
});
const { state: genesisState, refresh: refreshGenesis } =
	useConfirmedTokenBalances(genesisScope);
const genesisTotal = computed(() =>
	genesisState.value.status === "ready"
		? summarizeTokenBalances(genesisState.value.outputs).fungible
		: undefined,
);
function refreshTokenBalances() {
	refreshBalances();
	refreshGenesis();
}

const tokenViewMode = useStorage<"table" | "grid">(
	"token_page_view_mode",
	"table",
);
if (tokenViewMode.value !== "table" && tokenViewMode.value !== "grid") {
	tokenViewMode.value = "table";
}
const tokenViewIndex = computed({
	get() {
		return tokenViewMode.value === "grid" ? 1 : 0;
	},
	set(value: number) {
		tokenViewMode.value = value === 1 ? "grid" : "table";
	},
});
const metadata = computed(() => {
	if (selectedRegistryName.value === "auth_chain") {
		return {
			loading: selectedMetadata.value.status === "loading",
			failed: selectedMetadata.value.status === "unavailable",
			identitySnapshot: selectedMetadata.value.status === "ready" ? selectedMetadata.value.identity : undefined,
		};
	}
	const registryState = registryStore.getTokenIdentity(category.value, selectedRegistryName.value);
	return {
		loading: registryStore.loadingProviders,
		identitySnapshot: registryState?.identity,
	};
});
const authchainLoading = authchainQueryLoading;
const decimals = computed(
	() => metadata.value.identitySnapshot?.token?.decimals || 0,
);
const hasNftCapability = computed(
	() => !!authchainElement.value?.genesesTx.nftCapability,
);
const effectiveTokenViewMode = computed(() =>
	hasNftCapability.value ? tokenViewMode.value : "table",
);
const tokenInfo = computed(() => {
	const genesis = authchainElement.value?.genesesTx;
	const status = balanceState.value;
	const pending =
		status.status === "loading" ? "Loading…" : "Unavailable — refresh balances";
	const genesisAddress =
		genesis?.lockingBytecode &&
		formatLockingBytecodeAddress(genesis.lockingBytecode, { tokenCategory: `\\x${category.value}` });
	const items: contentWarpItem[] = [
		{
			title: "Genesis transaction",
			text: genesis?.hash,
			url: genesis?.hash ? `/tx/${genesis.hash}` : undefined,
			copy: true,
			warp: true,
		},
		{
			title: "Selected BCMR OP_RETURN",
			text: authchainElement.value?.opreturn || null,
			copy: true,
		},
		{
			title: "Genesis fungible supply",
			text: genesisTotal.value
				? calculateDecimal(genesisTotal.value, decimals.value).toFixed()
				: authchainLoading.value || genesisState.value.status === "loading"
					? "Loading…"
					: "Unknown",
		},
		{
			title: "Unspent fungible supply",
			text: totals.value
				? calculateDecimal(totals.value.fungible, decimals.value).toFixed()
				: pending,
		},
		{
			title: "Unspent NFTs (all capabilities)",
			text: totals.value ? totals.value.nfts.toFixed() : pending,
		},
		{
			title: "Minting-capable NFT exists",
			text: totals.value ? (totals.value.minting ? "Yes" : "No") : pending,
		},
		{ title: "BCMR authhead output balance (not issuer reserves)", text: (() => { try { return reservedSupply.value == null ? "Unknown" : calculateDecimal(exactTokenAmount(reservedSupply.value), decimals.value).toFixed(); } catch { return "Unavailable"; } })() },
		{ title: "Issuer reserves", text: "Unknown" },
		{ title: "Circulating supply", text: "Unknown" },
	];
	if (genesisAddress) {
		items.push({
			title: "First genesis recipient",
			text: genesisAddress,
			url: `/address/${genesisAddress}`,
			copy: true,
		});
	}
	return items;
});
</script>
