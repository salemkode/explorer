<template>
  <div class="card">
    <h3 class="p-3">Block chain blocks</h3>
    <div v-if="blockList.type == 'error'" class="my-5 py-5 text-center">
      <h5>Not Found block list</h5>
    </div>
    <div v-else ref="element" class="blocks px-3">
      <TransitionGroup name="list">
        <NuxtLink
          v-for="(block, i) in blockList.value"
          :key="i"
          :to="typeof block === 'string' ? undefined : `/block/${block.height}`"
          class="block-container nav-link"
        >
          <BlockCapacity
            :size-bytes="typeof block === 'string' ? 0 : +block.size_bytes"
            class="me-3"
          />
          <span v-if="typeof block === 'string'" v-text="$t('loading')" />
          <Transition v-else name="fade" mode="out-in">
            <div v-if="!block" v-text="$t('loading')" />
            <div v-else :key="block.height" class="d-flex flex-column">
              <b v-text="numberWithCommas(block.height)" />
              <small
                v-text="formatDateString(new Date(1000 * +block.timestamp))"
              />
              <b>
                {{ block.transaction_count }} Txs •
                {{ bytesToMB(+block.size_bytes) }}MB
              </b>
            </div>
          </Transition>
        </NuxtLink>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type GetBlocksSubscription, GetBlocks } from "~/module/chaingraph";
import { formatDateString, numberWithCommas, bytesToMB } from "~/module/utils";
import { useStateStore } from "~/store";

const element = ref<HTMLDivElement | null>(null);
const stateStore = useStateStore();
const { t } = useI18n();
const variables = computed(() => ({
  limit: 7,
  offset: 0,
  network: stateStore.network,
}));
const { result, loading, error } = useSubscription<GetBlocksSubscription>(
  GetBlocks,
  variables
);

// create computed var to create virtual list to loading
const blockList = computed(() => {
  if (result.value) {
    return {
      type: "loaded",
      value: result.value.block,
    } as const;
  } else if (loading.value) {
    return {
      type: "loading",
      value: Array.from({ length: variables.value.limit }, () => t("loading")),
    } as const;
  } else {
    return {
      type: "error",
      value: error.value || undefined,
    } as const;
  }
});
</script>

<style lang="scss" scoped>
.blocks {
  --block-size: 60px;
  --space-size: 15px;
  scroll-behavior: smooth;

  .block-container {
    display: flex;
    align-items: center;
    padding: 10px 0;
  }
}

@media (min-width: 768px) {
  .blocks {
    --block-size: 70px;
    --space-size: 20px;
  }
}
</style>
