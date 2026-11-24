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
      <AdBanner slot-id="token-top" class="mb-6" />

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
              :key="`${stateStore.network}:${category}:addresses`"
              :holders="holderState"
              :decimals="decimals"
            />
            <TokenTransaction :key="`${stateStore.network}:${category}:transactions`" :category="category" />
          </template>

          <TokenChild
            :outputs="unspent"
            @retry="retryTokenOutputs"
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
import { useStorage } from "~/hooks/storage";
import { type LoadState, useTokenOutputs } from "~/hooks/tokenStats";
import { decodeAuthChain } from "~/module/bcmr";
import { formatTokenAmount } from "~/module/tokenAmount";
import {
	computeHolderStats,
	computeReserve,
	computeSupplyFigures,
	getTokenType,
	type IdentityOutput,
	type ReserveStats,
	type TokenHolderStats,
} from "~/module/tokenStats";
import { useRegistryStore, useStateStore } from "~/store";
import type { contentWarpItem } from "~/types";

const route = useRoute();
const category = computed(() =>
	typeof route.params.category === "string" ? route.params.category : "",
);
const router = useRouter();

const stateStore = useStateStore();
const registryStore = useRegistryStore();
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
const {
	issuing,
	unspent,
	burns,
	retry: retryTokenOutputs,
} = useTokenOutputs(category);
/** Output 0 of the selected chain's authhead; its FT counts as reserved supply. */
const identityOutput = computed<IdentityOutput | null>(() => {
	const chains =
		authchain.value?.transaction.find(
			({ hash }) => hash.substring(2) === category.value,
		)?.authchains ?? [];
	const selectedId = selection.value.chain?.id;
	const chain =
		chains.find(
			(chain) =>
				(chain.authhead_transaction_hash || chain.authhead?.hash)?.substring(
					2,
				) === selectedId,
		) ?? chains.at(0);
	const authhead = chain?.authhead;
	const output = authhead?.identity_output?.at(0);
	if (!authhead || !output) return null;
	return { authheadHash: authhead.hash, ...output };
});
const holderState = computed<LoadState<TokenHolderStats>>(() =>
	unspent.value.status === "ready"
		? {
				status: "ready",
				value: computeHolderStats(unspent.value.value, identityOutput.value),
			}
		: unspent.value,
);
/** From the full holder scan when complete, otherwise from the issuing outputs. */
const reserveState = computed<LoadState<ReserveStats>>(() => {
	if (holderState.value.status === "ready")
		return { status: "ready", value: holderState.value.value };
	if (issuing.value.status === "ready")
		return {
			status: "ready",
			value: computeReserve(issuing.value.value, identityOutput.value),
		};
	// The quick query failed or could be incomplete: wait for the full scan.
	if (issuing.value.status === "error" && holderState.value.status === "loading")
		return { status: "loading" };
	return issuing.value;
});

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
const symbol = computed(
	() => metadata.value.identitySnapshot?.token?.symbol || "",
);
const amountText = (amount: bigint) =>
	`${formatTokenAmount(amount, decimals.value)}${symbol.value ? ` ${symbol.value}` : ""}`;
const countText = (count: number) => count.toLocaleString("en-US");
const pendingText = (state: LoadState<unknown>) =>
	state.status === "loading" ? "Loading…" : "Unavailable";

const tokenInfo = computed(() => {
	if (!authchainElement.value) return;
	const {
		hash: genesisTx,
		lockingBytecode,
		nftCapability,
	} = authchainElement.value.genesesTx;
	const genesisSupply = BigInt(authchainElement.value.genesesTx.genesisSupply);
	const hasGenesisNFTs = !!nftCapability;
	const opreturn = authchainElement.value.opreturn;
	const genesisAddress =
		lockingBytecode &&
		formatLockingBytecodeAddress(lockingBytecode, {
			tokenCategory: `\\x${category.value}`,
		});
	const hasFT = genesisSupply > 0n;
	const holders = holderState.value;
	const burnState = burns.value;
	const supply =
		holders.status === "ready"
			? computeSupplyFigures(
					genesisSupply,
					holders.value,
					burnState.status === "ready" ? burnState.value : undefined,
				)
			: undefined;
	const holderText = (pick: (stats: TokenHolderStats) => string) =>
		holders.status === "ready" ? pick(holders.value) : pendingText(holders);
	const reserve = reserveState.value;
	const reserveText = (pick: (stats: ReserveStats) => string) =>
		reserve.status === "ready" ? pick(reserve.value) : pendingText(reserve);

	const items: contentWarpItem[] = [
		{
			title: "Genesis Transaction",
			text: genesisTx,
			url: `/tx/${genesisTx}`,
			copy: true,
			warp: true,
		},
		{
			title: "Selected BCMR OP_RETURN",
			text: opreturn || null,
			copy: true,
		},
		{
			title: "Token Type",
			text: getTokenType(genesisSupply, hasGenesisNFTs),
		},
	];

	if (hasFT) {
		items.push(
			{ title: "Genesis Supply", text: amountText(genesisSupply) },
			{
				title: "Reserved Supply",
				text: reserveText((stats) => amountText(stats.reservedFT)),
			},
			{
				title: "Circulating Supply",
				text: reserveText((stats) =>
					amountText(genesisSupply - stats.reservedFT),
				),
			},
			{
				title: "Circulating Supply (Excluding Burns)",
				text: supply
					? amountText(supply.circulatingExclBurnsFT)
					: pendingText(holders),
			},
		);
		if (supply?.inconsistent) {
			items.push({
				title: "Removed From Supply",
				text: "Chaingraph data is inconsistent; unspent supply exceeds genesis supply minus burns",
			});
		} else if (supply) {
			if (burnState.status !== "ready") {
				if (supply.removedFT > 0n)
					items.push({
						title: "Removed From Supply",
						text: amountText(supply.removedFT),
					});
			} else {
				if (supply.burnedFT && supply.burnedFT > 0n)
					items.push({
						title: "Burned (Sent To A Burn Output)",
						text: amountText(supply.burnedFT),
					});
				if (
					supply.removedWithoutBurnOutputFT &&
					supply.removedWithoutBurnOutputFT > 0n
				)
					items.push({
						title: "Removed Without A Burn Output",
						text: amountText(supply.removedWithoutBurnOutputFT),
					});
			}
		}
	}

	const nftCount =
		holders.status === "ready" ? holders.value.totalNFTs : undefined;
	if (hasGenesisNFTs || (nftCount !== undefined && nftCount > 0)) {
		items.push({
			title: "Total NFTs",
			text: nftCount === undefined ? pendingText(holders) : countText(nftCount),
		});
	}
	if (burnState.status === "ready" && burnState.value.burnedNFTs > 0) {
		items.push({
			title: "Burned NFTs",
			text: countText(burnState.value.burnedNFTs),
		});
	}

	items.push(
		{
			title: "Is Active Minting",
			text: reserveText((stats) => (stats.hasActiveMinting ? "Yes" : "No")),
		},
		{
			title: "User Addresses Holding",
			text: holderText((stats) => countText(stats.userAddresses)),
		},
		{
			title: "Smart Contract Addresses Holding",
			text: holderText((stats) => countText(stats.contractAddresses)),
		},
		{
			title: "Total Holding Addresses",
			text: holderText((stats) => countText(stats.totalAddresses)),
		},
	);
	if (hasFT) {
		items.push(
			{
				title: "Held On User Addresses",
				text: holderText((stats) => amountText(stats.userFT)),
			},
			{
				title: "Held In Smart Contracts",
				text: holderText((stats) => amountText(stats.contractFT)),
			},
		);
	}

	if (genesisAddress) {
		items.push({
			title: "First Genesis Recipient",
			text: genesisAddress,
			url: `/address/${genesisAddress}`,
			copy: true,
		});
	}

	return items;
});
</script>
