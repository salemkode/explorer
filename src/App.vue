<template>
  <div class="app">
    <header>
      <nav-search />
      <nav class="container d-flex justify-content-between my-3">
        <router-link class="navbar-brand d-flex align-items-center" to="/">
          <img
            src="https://chipnet.bch.ninja/img/logo/bch.svg"
            width="30"
            alt=""
          />
          <h5 class="my-0 mx-2">Bitcoin Cash Explorer</h5>
        </router-link>
        <!--
        <div class="m-2">
        <ul class="navbar-nav d-flex">
          <button class="nav-item btn" @click="appStore.toggleNetwork">
            {{ appStore.network === "mainnet" ? "chipnet" : "mainnet" }}
          </button>
        </ul>
      </div>
      --></nav>
    </header>
    <RouterView />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~/store";
import { GetLastBlockSubscription, GetLastBlock } from "~/module/chaingraph";
import { DefaultProvider } from "mainnet-js";

const appStore = useAppStore();
const variables = computed(() => ({
  network: appStore.network,
}));
const { result } = useSubscription<GetLastBlockSubscription>(
  GetLastBlock,
  variables
);
watch(result, () => {
  appStore.lastBlockHeight = result.value?.node_block[0].block.height || "0";
});

DefaultProvider.servers.testnet = ["wss://chipnet.imaginary.cash:50004"];
</script>

<style>
.app {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
</style>
