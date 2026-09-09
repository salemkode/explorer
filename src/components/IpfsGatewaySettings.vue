<template>
  <div>
    <component :is="headingTag" class="mb-2">IPFS gateway</component>
    <p class="text-muted small mb-3">
      Choose the public gateway used to load token icons and metadata.
    </p>
    <select v-model="selectedIpfsGateway" class="form-select">
      <option value="">Default ({{ runtimeGateway }})</option>
      <option
        v-for="gateway in PUBLIC_IPFS_GATEWAYS"
        :key="gateway.url"
        :value="gateway.url"
      >
        {{ gateway.name }} ({{ gateway.url }})
      </option>
    </select>
    <label class="form-label mt-3 mb-1" :for="`${id}-custom-gateway`">
      Custom gateway
    </label>
    <input
      :id="`${id}-custom-gateway`"
      v-model="selectedIpfsGateway"
      class="form-control"
      type="url"
      placeholder="https://your-gateway.example"
      spellcheck="false"
    />
    <small class="text-muted">
      Enter a gateway origin without the trailing <code>/ipfs</code> path.
    </small>
  </div>
</template>

<script setup lang="ts">
import { PUBLIC_IPFS_GATEWAYS, selectedIpfsGateway } from "~/module/ipfs";

withDefaults(
	defineProps<{
		headingTag?: string;
	}>(),
	{ headingTag: "h5" },
);

const id = useId();
const runtimeGateway = useRuntimeConfig().public.ipfsGateway;
</script>
