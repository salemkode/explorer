<template>
  <LoadingView v-if="historyLoading" />
  <div
    v-else-if="lockingBytecode && tokenAddress"
    class="address-page overflow-hidden container d-lg-grid"
  >
    <AddressHeader :address="routeAddress" class="d-lg-none" />
    <div class="column">
      <ContentWarp
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
            <AddressTransaction v-if="validHistory" :history="validHistory" />
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
            <AddressTokens class="mt-2" :locking-bytecode="lockingBytecode" />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  addressToLockingBytecodeHex,
  lockingBytecodeHexToCashAddress,
  satToBch,
} from "~/module/utils";
import { useAppStore } from "~/store";
import { getBalance, getHistory } from "~/module/electrum";
import type { contentWarp } from "~/types";

const navItem = ref(0);
// Get address from router param using useRouter
const route = useRoute();
const appStore = useAppStore();
const routeAddress = computed(() => route.params.address as string);
const lockingBytecode = computed(() =>
  addressToLockingBytecodeHex(routeAddress.value)
);
if (!lockingBytecode.value) {
  throw createError({
    statusCode: 404,
    message: "Invalid address",
  });
}

const prefix = computed(() =>
  appStore.network === "mainnet" ? "bitcoincash" : "bchtest"
);
const tokenAddress = computed(() =>
  lockingBytecodeHexToCashAddress(
    lockingBytecode.value || "",
    prefix.value,
    true
  )
);

const { data: history, pending: historyLoading } = useLazyAsyncData(() =>
  getHistory(routeAddress.value, appStore.network)
);
const { data: balance } = useAsyncData(async () => {
  if (tokenAddress.value) {
    const result = await getBalance(tokenAddress.value);
    return result instanceof Error ? undefined : result;
  }
});
const validHistory = computed(() => {
  if (!(history.value instanceof Error) && history.value) {
    return history.value;
  }
});

if (!historyLoading && validHistory.value?.length === 0) {
  throw createError({
    statusCode: 404,
    message: "Invalid address",
  });
}
const addressInfoWarp = computed<contentWarp[]>(() => {
  const addressInfo = {
    firstTx: validHistory.value?.at(-1)?.tx_hash || "",
    txCount: validHistory.value?.length.toString(),
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
      text: lockingBytecodeHexToCashAddress(
        lockingBytecode.value || "",
        prefix.value,
        false
      ),
      copy: true,
      warp: true,
    },
    {
      title: "Balance",
      text:
        balance.value?.unconfirmed !== undefined
          ? `${satToBch(balance.value.confirmed)} BCH`
          : "",
    },
    {
      title: "Unconfirmed Balance",
      text: balance.value?.unconfirmed
        ? `${satToBch(balance.value.unconfirmed)} BCH`
        : "",
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
