<!-- eslint-disable vue/no-parsing-error -->
<template>
  <div
    v-if="lockingBytecode && tokenAddress"
    class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
  >
    <!-- Mobile Address Header -->
    <AddressHeader :address="routeAddress" class="lg:hidden mb-6" />

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Address Information -->
      <div class="lg:col-span-4 space-y-6">
        <content-warp
          :loading="!addressInfoWarp.length"
          :items="addressInfoWarp"
        />
      </div>

      <!-- Right Column: Desktop Header & Tabs -->
      <div class="lg:col-span-8 space-y-6">
        <AddressHeader :address="routeAddress" class="hidden lg:flex" />

        <VTabs :items="navItems">
          <template #transaction>
            <AddressTransaction
              v-if="addressResponse.history.length"
              :history="addressResponse.history"
            />
            <div
              v-else
              class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-8 text-center text-sm text-slate-400 dark:text-zinc-500 shadow-xs"
            >
              No transaction history found for this address
            </div>
          </template>
          <template #cash_token>
            <div class="space-y-6">
              <AddressNFTs :locking-bytecode="lockingBytecode" />
              <AddressTokens :locking-bytecode="lockingBytecode" />
            </div>
          </template>
        </VTabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUsdPrice } from "~/hooks/usdPrice";
import { addressToLockingBytecodeHex } from "~/module/bitcoin";
import { electrum } from "~/module/electrum";
import { useStateStore } from "~/store";
import type { contentWarpItem } from "~/types";

const navItems = ["transaction", "cash_token"] as const;
// Get address from router param using useRouter
const route = useRoute();
const stateStore = useStateStore();
const { formatPrice } = useUsdPrice();

const routeAddress = computed(() => route.params.address as string);
const lockingBytecode = computed(() =>
	addressToLockingBytecodeHex(routeAddress.value),
);
if (!lockingBytecode.value) {
	showError({
		statusCode: 404,
		message: "Invalid address",
	});
}

const tokenAddress = computed(() =>
	stateStore.lockingBytecodeHexToCashAddress(lockingBytecode.value || "", true),
);

const { data: history } = useAsyncData(() =>
	electrum.request("blockchain.address.get_history", routeAddress.value),
);
const { data: balance } = useAsyncData(() =>
	electrum.request("blockchain.address.get_balance", routeAddress.value),
);

const addressResponse = computed(() => {
	const emptyBalance = {
		confirmed: 0,
		unconfirmed: 0,
	};
	const _balance = !(balance.value instanceof Error) && balance.value;
	const _history = !(history.value instanceof Error) && history.value;

	return {
		history: _history || [],
		balance: _balance || emptyBalance,
	};
});

const addressInfoWarp = computed<contentWarpItem[]>(() => {
	const addressInfo = {
		firstTx: addressResponse.value.history?.at(-1)?.tx_hash || "",
		txCount: addressResponse.value.history?.length.toString(),
	};
	return [
		{
			title: "Token Address",
			text: tokenAddress.value,
			copy: true,
			warp: true,
		},
		{
			title: "Cash Address",
			text: stateStore.lockingBytecodeHexToCashAddress(
				lockingBytecode.value || "",
				false,
			),
			copy: true,
			warp: true,
		},
		{
			title: "Balance",
			text: formatPrice(addressResponse.value?.balance.confirmed),
		},
		{
			title: "Unconfirmed Balance",
			text: formatPrice(addressResponse.value?.balance.unconfirmed),
		},
		{
			title: "First Transaction",
			text: addressInfo?.firstTx,
			copy: true,
			url: `/tx/${addressInfo?.firstTx}`,
			warp: true,
		},
		{
			title: "Transaction Count",
			text: addressInfo?.txCount,
		},
	];
});
</script>
