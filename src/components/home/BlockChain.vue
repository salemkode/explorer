<template>
  <div v-show="result || loading" class="my-3">
    <h3 class="d-flex justify-content-between">
      Block chain blocks
      <BasePagination
        :has-next-page="state.hasRightScroll"
        :has-prev-page="state.hasLeftScroll"
        @previous="slideLeft"
        @next="slideRight"
      />
    </h3>
    <!-- blocks-container -->
    <div ref="element" class="blocks ps-2 py-3">
      <NuxtLink
        v-for="(block, i) in blocks"
        :key="i"
        :to="block.loading ? undefined : `/block/${block.height}`"
        class="block-container nav-link"
      >
        <BlockCapacity
          :size-bytes="block.size_bytes"
          :loading="block.loading"
          class="block"
        />
        <Transition name="fade" mode="out-in">
          <small :key="block.height" v-text="block.height" />
        </Transition>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type GetBlocksSubscription, GetBlocks } from "~/module/chaingraph";
import { useStateStore } from "~/store";

const element = ref<HTMLDivElement | null>(null);
const { t } = useI18n();
const stateStore = useStateStore();
const variables = computed(() => ({
  limit: 30,
  offset: 0,
  network: stateStore.network,
}));
const { result, loading } = useSubscription<GetBlocksSubscription>(
  GetBlocks,
  variables
);

const state = reactive({
  hasLeftScroll: false,
  hasRightScroll: false,
});

const scrollEndTimer = ref("");

onUpdated(() => {
  updateElement();
});
onMounted(() => {
  if (!element.value) return;
  element.value.onscroll = () => {
    clearTimeout(scrollEndTimer.value);
    scrollEndTimer.value = "" + setTimeout(updateElement, 100);
  };
});

const updateElement = () => {
  if (!element.value) return;
  // Get the scroll position and the scroll width of the content element
  const scrollPosition = element.value.scrollLeft + element.value.clientWidth;
  const scrollWidth = element.value.scrollWidth;

  // Compare the scroll position and the scroll width
  // If they are equal, it means the scroll has reached the end
  state.hasRightScroll = scrollPosition !== scrollWidth;
  state.hasLeftScroll = element.value.scrollLeft > 0;
};
const slideLeft = () => {
  element.value?.scrollBy({
    left: -200,
    behavior: "smooth",
  });
};
const slideRight = () => {
  element.value?.scrollBy({
    left: 200,
    behavior: "smooth",
  });
};

const blocks = computed(() => {
  if (!result.value) {
    return Array.from({ length: 30 }, () => {
      return {
        loading: true,
        height: t("loading"),
        size_bytes: 0,
      };
    });
  }

  return result.value.block.map((block) => ({
    loading: false,
    height: block.height,
    size_bytes: +block.size_bytes,
  }));
});
</script>

<style lang="scss" scoped>
.blocks {
  --block-size: 60px;
  --space-size: 15px;
  scroll-behavior: smooth;

  display: flex;
  max-width: calc(100vw - var(--bs-gutter-x, 1.5rem) * 2);
  overflow: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  .block-container {
    margin-right: var(--space-size);
    text-align: center;

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

      &::before {
        content: "";
        background-color: var(--bs-primary);
        position: absolute;
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        height: 1px;
        width: calc(var(--space-size) + 1px);
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
