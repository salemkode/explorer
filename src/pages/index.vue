<template>
  <div>
    <HomeHero />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10 pb-16">
      <HomeNetworkActivity :key="stateStore.network" :network="stateStore.network" />
      <HomeCashTokenActivity class="mt-6" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStateStore } from "~/store";

const stateStore = useStateStore();
</script>
