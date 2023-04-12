<template>
  <div class="app">
    <header>
      <nav-search />
      <nav class="container d-flex justify-content-between my-3">
        <router-link class="navbar-brand d-flex align-items-center" to="/">
          <img src="/bch.svg" width="30" alt="" />
          <h5 class="my-0 mx-2">Bitcoin Cash Explorer</h5>
        </router-link>
      </nav>
    </header>
    <slot />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~/store";
import { GetLastBlockSubscription, GetLastBlock } from "~/module/chaingraph";

const appStore = useAppStore();
const variables = computed(() => ({
  network: appStore.network,
}));
const { result } = useSubscription<GetLastBlockSubscription>(
  GetLastBlock,
  variables
);
watch(result, () => {
  appStore.lastBlockHeight =
    result.value?.node_block.at(0)?.block.height || "0";
});
</script>

<style>
.app {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
