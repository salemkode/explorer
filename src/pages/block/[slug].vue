<template>
  <div v-if="result" class="container">
    <div class="block-page overflow-hidden d-lg-grid">
      <div class="column">
        <content-warp :loading="false" :items="blockItemWarp" />
      </div>
      <div class="column">
        <BlockHeader :height="result.block.at(0)?.height || ''" />
        <BlockTransaction
          v-model:offset="offsetTxs"
          :limit="variable.limitTxs"
          :transactions="transactions"
          :loading="loading"
        />
      </div>
    </div>
  </div>
  <LoadingView v-else-if="loading" />
</template>

<script setup lang="ts">
import { GetBlock } from "~/module/chaingraph";
import { useStateStore } from "~/store";
import type { bytea, contentWarpItem } from "~/types";

// Get slug from router param using useRouter
const route = useRoute();
const blockHashOrHeight = computed(() => route.params.slug as bytea);
const stateStore = useStateStore();
const offsetTxs = ref(0);
const variable = computed(() => ({
  network: stateStore.network,
  hash: blockHashOrHeight.value,
  height: blockHashOrHeight.value,
  limitTxs: 9,
  offsetTxs: offsetTxs.value,
}));
const { result, loading } = useQuery(GetBlock, variable);
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
      title: "Input total",
      text: stateStore.formatPrice(block.input_value_satoshis || "0"),
    },
    {
      title: "Output total",
      text: stateStore.formatPrice(block.output_value_satoshis || "0"),
    },
    {
      title: "Input count",
      text: block.input_count,
    },
    {
      title: "Output count",
      text: block.output_count,
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
