<template>
  <div
    v-if="lockingBytecode && tokenAddress"
    class="address-page overflow-hidden container d-lg-grid"
  >
    <AddressHeader :address="routeAddress" class="d-lg-none" />
    <div class="column">
      <content-warp
        :loading="!addressInfoWarp.length"
        :items="addressInfoWarp"
      />
    </div>
    <div class="column">
      <AddressHeader :address="routeAddress" class="d-none d-lg-flex" />
      <NavPills
        v-model:select="navItem"
        :items="['transaction', 'cash_token']"
      />
      <div class="d-flex flex-column">
        <Transition name="fade">
          <div
            v-show="navItem === 0"
            :style="{
              order: navItem === 0 ? 1 : 0,
            }"
          >
            <AddressTransaction
              v-if="addressResponse.history.length"
              :history="addressResponse.history"
            />
          </div>
        </Transition>
        <Transition name="fade">
          <div
            v-show="navItem === 1"
            :style="{
              order: navItem === 1 ? 1 : 0,
            }"
          >
            <AddressNFTs :locking-bytecode="lockingBytecode" />
            <AddressTokens class="mt-4" :locking-bytecode="lockingBytecode" />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { addressToLockingBytecodeHex } from "~/module/bitcoin";
import { useStateStore } from "~/store";
import type { contentWarpItem } from "~/types";
import { electrum } from "~/module/electrum";

const navItem = ref(0);
// Get address from router param using useRouter
const route = useRoute();
const stateStore = useStateStore();
const routeAddress = computed(() => route.params.address as string);
const lockingBytecode = computed(() =>
  addressToLockingBytecodeHex(routeAddress.value)
);
if (!lockingBytecode.value) {
  showError({
    statusCode: 404,
    message: "Invalid address",
  });
}

const tokenAddress = computed(() =>
  stateStore.lockingBytecodeHexToCashAddress(lockingBytecode.value || "", true)
);

const { data: history } = useAsyncData(() =>
  electrum.request("blockchain.address.get_history", routeAddress.value)
);
const { data: balance } = useAsyncData(() =>
  electrum.request("blockchain.address.get_balance", routeAddress.value)
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
        false
      ),
      copy: true,
      warp: true,
    },
    {
      title: "Balance",
      text: stateStore.formatPrice(addressResponse.value?.balance.confirmed),
    },
    {
      title: "Unconfirmed Balance",
      text: stateStore.formatPrice(addressResponse.value?.balance.unconfirmed),
    },
    {
      title: "First Transition",
      text: addressInfo?.firstTx,
      copy: true,
      url: `/tx/${addressInfo?.firstTx}`,
      warp: true,
    },
    {
      title: "Transition count",
      text: addressInfo?.txCount,
    },
  ];
});
</script>

<style scoped>
.address-page {
  grid-template-columns: 1fr 2.5fr;
  gap: 15px;
}
.address-page .column {
  overflow-x: hidden;
}
.address-page .column > * {
  margin-top: 10px;
}

.fade-enter-active {
  transition-delay: 0.6s;
}
.fade-leave-active {
  transition-delay: 0;
}
</style>
