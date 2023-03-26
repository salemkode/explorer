<template>
  <div
    v-if="typeof address === 'string'"
    class="card p-2 my-2 align-items-start"
  >
    <Copy class="small" :text="removeAddressPrefix(address)" copy />
    <span class="my-1"> {{ satToBch(sat || "") }} BCH </span>
    <NuxtLink
      v-if="tokenCategory && tokenAmount"
      class="badge text-bg-dark d-flex align-items-center"
      :to="`/token/${tokenCategory}`"
    >
      {{ shortTx(tokenCategory) }} <span class="dot" /> {{ tokenAmount }}
      {{ bcmrStore.tokens.get(tokenCategory)?.token?.symbol }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { satToBch, removeAddressPrefix, shortTx } from "~/module/utils";
import { useBcmrStore } from "~/store";

const bcmrStore = useBcmrStore();
const props = defineProps<{
  address: string | object;
  sat: string;
  tokenCategory?: string;
  tokenAmount?: string;
}>();

watchEffect(() => {
  if (props.tokenCategory) useBcmrStore().getTokenInfo(props.tokenCategory);
});
</script>

<style scoped>
.dot {
  width: 6px;
  margin: auto 9px;
  height: 6px;
  background-color: var(--bs-badge-color);
  border-radius: 50%;
  display: inline-block;
}

.small {
  font-size: 14px;
}
</style>
