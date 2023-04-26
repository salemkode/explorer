<template>
  <div class="card">
    <h3 class="p-3">Block chain blocks</h3>
    <div v-if="blockList.type == 'error'" class="my-5 py-5 text-center">
      <small>Not Found block list</small>
    </div>
    <div v-else ref="element" class="blocks px-3" @wheel="mouseWheel">
      <TransitionGroup name="list">
        <NuxtLink
          v-for="(block, i) in blockList.value"
          :key="i"
          :to="typeof block === 'string' ? undefined : `/block/${block.height}`"
          class="block-container nav-link"
        >
          <div class="block me-3">
            <div
              class="capacity"
              :style="{
                '--capacity-size': getCapacitySize(block),
              }"
            />
          </div>
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
      <NuxtLink to="/block" class="btn btn-primary w-100 my-2">
        See more
      </NuxtLink>
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

const mouseWheel = (e: WheelEvent) => {
  if (!e.deltaX) {
    e.preventDefault();
    element.value?.scrollBy({
      left: e.deltaY < 0 ? -100 : 100,
    });
  }
};

// create computed var to create virtual list to loading
const blockList = computed(() => {
  if (result.value) {
    return {
      type: "loaded",
      value: result.value.block,
    } as const;
  } else if (loading.value) {
    // I know I can use fill but I want change array type
    // I use fill instead of Array.from({ length: 7 }, () => undefined)
    // https://github.com/microsoft/TypeScript/issues/31785
    return {
      type: "loading",
      value: Array.from({ length: 7 }, () => t("loading")),
    } as const;
  } else {
    return {
      type: "error",
      value: error.value || undefined,
    } as const;
  }
});

const getCapacitySize = (block: GetBlocksSubscription["block"][0] | string) => {
  if (typeof block === "string") return "0%";
  return `${+(block.size_bytes || 0) / 10_485}%`;
};
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

    &:last-child .block {
      &::before {
        display: none;
      }
    }

    .block {
      position: relative;

      .capacity {
        width: var(--block-size);
        height: var(--block-size);
        border-radius: 5px;
        background: rgb(238, 238, 238);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        overflow: hidden;

        &::before {
          content: "";
          background-color: var(--bs-primary);
          height: var(--capacity-size);
          transition: height 0.8s linear;
        }
      }
    }
  }
}

@media (min-width: 768px) {
  .blocks {
    --block-size: 70px;
    --space-size: 20px;
  }
}
</style>
