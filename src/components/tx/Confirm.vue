<template>
  <div>
    <div class="d-flex align-items-center">
      <Progress :percentage="percentage" />
      <div class="px-3">
        <div>Transaction status</div>
        <h4 class="my-2">
          <template v-if="stateStore.lastBlockHeight === '0'">
            Loading...
          </template>
          <template v-else-if="confirm >= 6">
            Confirmed
            {{ confirm }}
            confirmations
          </template>
          <template v-else>
            Confirmed {{ confirm }} of 6 confirmations
          </template>
        </h4>
        <div>Block id {{ numberWithCommas(props.blockHeight) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStateStore } from "~/store";
import { numberWithCommas } from "~/module/utils";

const stateStore = useStateStore();
const props = defineProps<{
  blockHeight: number;
}>();

const confirm = computed(
  () => +stateStore.lastBlockHeight - props.blockHeight + 1
);
const percentage = computed(() =>
  Math.round(Math.max(Math.min(100, (confirm.value / 6) * 100), 0))
);
</script>
