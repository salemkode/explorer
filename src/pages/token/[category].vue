<template>
  <div class="w-full">
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
        :identity-snapshot="metadata.identitySnapshot"
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
            :select="metadata.name"
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
            :identity-snapshot="metadata.identitySnapshot"
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
              v-if="hasNftCapability"
              :key="`${stateStore.network}:${category}:addresses`"
              :decimals="decimals"
              :category="category"
            />
            <TokenTransaction :key="`${stateStore.network}:${category}:transactions`" :category="category" />
          </template>

          <TokenChild
            :key="`${stateStore.network}:${category}:children`"
            :identity-snapshot="metadata.identitySnapshot"
            :category="category"
            :view-mode="effectiveTokenViewMode"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIsActiveMinting } from "~/hooks/activeMinting";
import { formatLockingBytecodeAddress } from "~/hooks/addressDisplay";
import { useAuthChains } from "~/hooks/authchains";
import { useNftSupply } from "~/hooks/nftSupply";
import { useNonBurnTokens } from "~/hooks/nonSpentToken";
import { useStorage } from "~/hooks/storage";
import { decodeAuthChain } from "~/module/bcmr";
import { getTokenInfoType } from "~/module/bitcoin";
import { useRegistryStore, useStateStore } from "~/store";
import type { contentWarpItem } from "~/types";

const route = useRoute();
const category = computed(() => String(route.params.category || ""));

const stateStore = useStateStore();
const registryStore = useRegistryStore();
const tokenCategory = computed(() => `\\x${category.value}` as const);
const navItem = ref(0);
const {
	result: authchain,
	loading: authchainQueryLoading,
	error: authchainError,
} = useAuthChains(toRef(() => [tokenCategory.value]));

const {
	supplyNFTs,
	error: supplyNFTsError,
	loading: supplyNFTsLoading,
} = useNftSupply(tokenCategory);
const {
	isActiveMinting,
	error: activeMintingError,
	loading: activeMintingLoading,
} = useIsActiveMinting(tokenCategory);
const {
	nonBurnTokens,
	error: nonBurnTokensError,
	loading: nonBurnTokensLoading,
} = useNonBurnTokens(tokenCategory);
const authchainElement = computed(
	() => authchain.value && decodeAuthChain(authchain.value, category.value),
);
const reservedSupply = computed(
	() =>
		authchain.value?.transaction
			.at(0)
			?.authchains.at(0)
			?.authhead?.identity_output?.at(0)?.fungible_token_amount,
);
const queryError = computed(
	() => authchainError.value || supplyNFTsError.value ||
		activeMintingError.value || nonBurnTokensError.value,
);

const selectedRegistryName = ref("");
watch(
	() => [category.value, stateStore.network],
	() => {
		selectedRegistryName.value = "";
		navItem.value = 0;
	},
	{ flush: "sync" },
);
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
	const isAuthchainLoading =
		registryStore.authchains.get(category.value) === true;
	const registryState = registryStore.getTokenIdentity(
		category.value,
		selectedRegistryName.value,
	);

	return {
		loading: registryStore.loadingProviders || isAuthchainLoading,
		failed: registryStore.authchains.get(category.value) === false,
		name: registryState?.name || "",
		identitySnapshot: registryState?.identity,
	};
});
const authchainLoading = computed(
	() =>
		authchainQueryLoading.value ||
		supplyNFTsLoading.value ||
		activeMintingLoading.value ||
		nonBurnTokensLoading.value,
);
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
	if (!authchainElement.value) return;
	const {
		hash: genesisTx,
		genesisSupply,
		lockingBytecode,
	} = authchainElement.value.genesesTx;
	const opreturn = authchainElement.value.opreturn;
	const reservedSupplyNumber =
		reservedSupply.value === null || reservedSupply.value === undefined
			? null
			: Number(reservedSupply.value);
	const ownerAddress =
		lockingBytecode && formatLockingBytecodeAddress(lockingBytecode, {
			tokenCategory: `\\x${category.value}`,
		});

	const items: contentWarpItem[] = [
		{
			title: "Genesis Transaction",
			text: genesisTx,
			url: `/tx/${genesisTx}`,
			copy: true,
			warp: true,
		},
		{
			title: "BCMR OP_RETURN",
			text: opreturn || null,
			copy: true,
		},
		{
			title: "Token Type",
			text: getTokenInfoType(genesisSupply, supplyNFTs.value),
		},
		{
			title: "Genesis Supply",
			text: genesisSupply || null,
		},
		{
			title: "Total Amount NFTs",
			text: supplyNFTs.value || null,
		},
		{
			title: "Reserve Supply",
			text: reservedSupplyNumber,
		},
		{
			title: "Circulating Supply",
			text:
				reservedSupplyNumber === null
					? null
					: genesisSupply - reservedSupplyNumber,
		},
		{
			title: "Is Active Minting",
			text: isActiveMinting.value ? "Yes" : "No",
		},
		{
			title: "Supply Excluding Burns",
			text: nonBurnTokens.value,
		},
	];

	if (ownerAddress) {
		items.push({
			title: "Owner Address",
			text: ownerAddress,
			url: `/address/${ownerAddress}`,
			copy: true,
		});
	}

	return items;
});
</script>
