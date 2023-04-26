<template>
  <LoadingView v-if="loading" />
  <div
    v-else-if="result"
    class="block-page overflow-hidden container d-lg-grid"
  >
    <h3 class="d-lg-none">Block Page</h3>
    <div class="column">
      <content-warp :loading="loading" :items="blockItemWarp" />
    </div>
    <div class="column">
      <h3 class="d-none d-lg-block">Block Page</h3>
      <BlockTransaction
        v-model:offset="variable.offsetTxs"
        :limit="variable.limitTxs"
        :transactions="transactions"
        :loading="loading"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { GetBlock, type GetBlockQuery } from "~/module/chaingraph";
import { useStateStore } from "~/store";
import type { contentWarpItem } from "~/types";

// Get slug from router param using useRouter
const route = useRoute();
const blockHashOrHeight = computed(() => route.params.slug as string);
const stateStore = useStateStore();
const variable = computed(() => ({
  network: stateStore.network,
  hash: blockHashOrHeight.value,
  height: blockHashOrHeight.value,
  limitTxs: 9,
  offsetTxs: 0,
}));
const { result, loading } = useQuery<GetBlockQuery>(GetBlock, variable);
const blockItemWarp = computed<contentWarpItem[]>(() => {
  const block = result.value?.block.at(0);
  if (!block) return [];
  return [
    {
      title: "Block Hash",
      text: block?.hash.substring(2),
      copy: true,
      warp: true,
    },
    {
      title: "Block height",
      text: block?.height,
      copy: true,
      warp: true,
    },
    {
      title: "Input count",
      text: block.input_count,
    },
    {
      title: "Input total",
      text: block.input_value_satoshis,
    },
    {
      title: "Output count",
      text: block.input_count,
    },
    {
      title: "Output total",
      text: block.input_value_satoshis,
    },
  ];
});

const transactions = computed(() => {
  const block = result.value?.block.at(0);
  if (!block) {
    return [];
  }
  return block.transactions?.map(({ transaction }) => transaction);
});
</script>

<style scoped>
.block-page {
  grid-template-columns: 1fr 2.5fr;
  gap: 15px;
}
.block-page .column {
  overflow-x: hidden;
}
.block-page .column > * {
  margin-top: 10px;
}

.fade-enter-active {
  transition-delay: 0.6s;
}
.fade-leave-active {
  transition-delay: 0;
}
</style>
