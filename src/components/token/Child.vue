<template>
  <client-only>
    <div v-if="props.loading || outputs.length !== 0" class="card">
      <h3 class="p-3">Token Child</h3>
      <LoadingVue v-if="props.loading" class="my-5 py-5" />
      <TableView :rows="outputs" :columns="['capability', 'commitment']" />
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { GetTokenChildQuery } from "@/module/chaingraph";
import { tableColumn } from "~/types/index.js";

const props = defineProps<{
  tokenChild?: GetTokenChildQuery;
  loading: boolean;
}>();

const outputs = computed<tableColumn[][]>(
  () =>
    props.tokenChild?.output.map((output) => [
      {
        text: output.nonfungible_token_capability,
      },
      {
        text: output.nonfungible_token_commitment?.substring(2) || "N/A",
      },
    ]) || []
);
</script>
