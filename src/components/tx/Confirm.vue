<template>
  <div>
    <div class="d-flex align-items-center">
      <Progress :percentage="percentage" />
      <div class="px-3">
        <div>Transaction status</div>
        <h4 v-if="confirm >= 6" class="my-2">
          Confirmed
          {{ confirm }}
          confirmations
        </h4>
        <h4 v-else class="my-2">Confirmed {{ confirm }} of 6 confirmations</h4>
        <div>Block id {{ numberWithCommas(props.blockHeight) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~/store";
import { numberWithCommas } from "~/module/utils";

const appStore = useAppStore();
const props = defineProps<{
  blockHeight: number;
}>();

const confirm = computed(
  () => +appStore.lastBlockHeight - props.blockHeight + 1
);
const percentage = computed(() =>
  Math.round(Math.min(100, (confirm.value / 6) * 100))
);
</script>
