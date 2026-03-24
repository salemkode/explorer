<template>
  <div class="d-flex align-items-center justify-content-center">
    <LoadingView v-if="authchainLoading" />
    <div v-else class="token-page overflow-hidden container d-lg-grid">
      <TokenId
        :loading="metadata.loading"
        :identity-snapshot="metadata.identitySnapshot"
        :category="category"
        class="d-lg-none"
      />
      <NavPills
        v-model:select="navItem"
        :items="['token_register', 'transaction']"
        class="d-lg-none"
      />
      <div
        class="column d-lg-block"
        :class="{
          'd-none': navItem === 1,
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
        <TokenProvider
          :select="metadata.name"
          :category="category"
          @select="(url) => (selectedRegistryName = url)"
        />
      </div>
      <div
        class="column d-lg-block"
        :class="{
          'd-none': navItem === 0,
        }"
      >
        <TokenId
          :loading="metadata.loading"
          :identity-snapshot="metadata.identitySnapshot"
          :category="category"
          class="d-none d-lg-block"
        />
        <NavPills
          v-if="hasNftCapability"
          v-model:select="tokenViewIndex"
          :items="['table_view', 'grid_view']"
        />
        <template v-if="effectiveTokenViewMode === 'table'">
          <TokenAddress
            v-if="hasNftCapability"
            :decimals="decimals"
            :category="category"
          />
          <TokenTransaction :category="category" />
        </template>
        <TokenChild
          :identity-snapshot="metadata.identitySnapshot"
          :category="category"
          :view-mode="effectiveTokenViewMode"
        />
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
import { useRegistryStore } from "~/store";
import type { contentWarpItem } from "~/types";

const route = useRoute();
const category = computed(() => route.params.category as string);

const registryStore = useRegistryStore();
const navItem = ref(0);
const {
	result: authchain,
	loading: authchainQueryLoading,
	onError,
} = useAuthChains(toRef(() => [`\\x${category.value}` as const]));

const { supplyNFTs, loading: supplyNFTsLoading } = useNftSupply(
	`\\x${category.value}`,
);
const { isActiveMinting, loading: activeMintingLoading } = useIsActiveMinting(
	`\\x${category.value}`,
);
const { nonBurnTokens, loading: nonBurnTokensLoading } = useNonBurnTokens(
	`\\x${category.value}`,
);
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
onError(() => {
	throw showError({
		statusCode: 404,
		message: "This transaction is not found",
	});
});

const selectedRegistryName = ref("");
const tokenViewMode = useStorage<"table" | "grid">("token_page_view_mode", "table");
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
		name: registryState?.name || "",
		identitySnapshot: registryState?.identity,
	};
});
const authchainLoading = computed(
	() =>
		authchainQueryLoading.value ||
		metadata.value.loading ||
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
		lockingBytecode &&
		formatLockingBytecodeAddress(lockingBytecode);

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
			title: "Token type",
			text: getTokenInfoType(genesisSupply, supplyNFTs.value),
		},
		{
			title: "Genesis Supply",
			text: genesisSupply || null,
		},
		{
			title: "Total amount NFTs",
			text: supplyNFTs.value || null,
		},
		{
			title: "Reserve supply",
			text: reservedSupplyNumber,
		},
		{
			title: "Circulating supply",
			text:
				reservedSupplyNumber === null
					? null
					: genesisSupply - reservedSupplyNumber,
		},
		{
			title: "Is active minting",
			text: isActiveMinting.value ? "Yes" : "No",
		},
		{
			title: "Supply excluding burns",
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

<style>
.token-page {
  grid-template-columns: 1fr 2.5fr;
  gap: 15px;
}
.token-page .column {
  overflow-x: hidden;
}
.token-page .column > * {
  margin-top: 10px;
}
</style>
