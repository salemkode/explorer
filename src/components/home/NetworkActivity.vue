<template>
  <div>
    <HomeNetworkStatus
      :network="network"
      :node="feed.node.value"
      :tip="feed.tip.value"
      :status="feed.status.value"
      :block-age="feed.blockAge.value"
      :checked-age="feed.checkedAge.value"
      @retry="feed.retry"
    />
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-7 xl:col-span-8">
        <HomeUnconfirmedTransaction :transactions="feed.transactions.value" :status="feed.status.value" :has-node="feed.node.value !== undefined" />
      </div>
      <div class="lg:col-span-5 xl:col-span-4">
        <HomeBlocksList />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHomeNetwork } from "~/composables/useHomeNetwork";

const props = defineProps<{ network: string }>();
const feed = useHomeNetwork(props.network);
</script>
