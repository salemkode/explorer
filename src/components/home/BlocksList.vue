<template>
  <div v-show="result || loading" class="card">
    <h3 class="p-3">Block chain blocks</h3>
    <div ref="element" class="blocks px-3" @wheel="mouseWheel">
      <NuxtLink
        v-for="i in 4"
        :key="i"
        :to="loading ? undefined : `/block/${atBlock(i - 1)?.height}`"
        class="block-container nav-link"
      >
        <div class="block me-3">
          <div
            class="capacity"
            :style="{
              '--capacity-size': `${
                +(result?.block.at(i - 1)?.size_bytes || 0) / 10_485
              }%`,
            }"
          />
        </div>
        <Transition name="fade" mode="out-in">
          <div v-if="!result?.block[i - 1]" v-text="$t('loading')" />
          <div
            v-else
            :key="result?.block[i - 1].height"
            class="d-flex flex-column"
          >
            <b v-text="numberWithCommas(result.block[i - 1].height)" />
            <small
              v-text="
                formatDateString(
                  new Date(1000 * +result.block[i - 1].timestamp)
                )
              "
            />
            <b
              v-text="
                `${result.block[i - 1].transaction_count} Txs • ${bytesToMB(
                  +result.block[i - 1].size_bytes
                )}MB`
              "
            />
          </div>
        </Transition>
      </NuxtLink>
    </div>
    <NuxtLink to="/block" class="btn btn-primary mt-auto">See more</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { type GetBlocksSubscription, GetBlocks } from "~/module/chaingraph";
import { formatDateString, numberWithCommas, bytesToMB } from "~/module/utils";
import { useAppStore } from "~/store";

const element = ref<HTMLDivElement | null>(null);
const appStore = useAppStore();
const variables = computed(() => ({
  limit: 8,
  offset: 0,
  network: appStore.network,
}));
const { result, loading } = useSubscription<GetBlocksSubscription>(
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

const atBlock = (index: number) => {
  return result.value?.block.at(index);
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
