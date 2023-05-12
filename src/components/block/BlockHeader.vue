<template>
  <div class="card p-3 py-4 flex-row justify-content-between">
    <template v-for="block in blocks" :key="block.height">
      <NuxtLink
        class="d-flex align-items-center block"
        :class="{
          show: block.height !== -1,
        }"
        :to="block.height === -1 ? '' : `/block/${block.height}`"
      >
        <button
          class="align-items-center btn btn-primary d-flex justify-content-center me-2 rounded-full"
          :style="{
            width: '55px',
            height: '55px',
          }"
        >
          <i class="uicon-block uicon-md" />
        </button>
        <span>
          {{ block.name }}
          <br />
          {{ block.height }}
        </span>
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useStateStore } from "~/store";

const stateStore = useStateStore();
const props = defineProps<{
  height: string;
}>();
const blocks = computed(() => [
  {
    name: "Previous",
    height: +props.height - 1,
  },
  {
    name: "Current",
    height: +props.height,
  },
  {
    name: "Next",
    height:
      stateStore.lastBlockHeight === props.height ? -1 : +props.height + 1,
  },
]);
</script>

<style scoped>
.uicon-block {
  font-size: 28px;
  min-width: 28px;
  height: 28px;
}

.block {
  text-decoration: none;
  color: inherit;
}

.block:not(:nth-child(2)) {
  transform: scale(0.9);
}
</style>
