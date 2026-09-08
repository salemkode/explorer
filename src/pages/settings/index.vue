<template>
  <div class="container py-4 settings-page">
    <div class="card p-4">
      <h3 class="mb-3">{{ $t("settings") }}</h3>
      <div>
        <h5 class="mb-3">{{ $t("address_display_format") }}</h5>

        <label class="form-check mb-2">
          <input
            v-model="addressDisplayMode"
            class="form-check-input"
            type="radio"
            value="token"
          />
          <span class="form-check-label">{{ $t("token_address") }}</span>
        </label>

        <label class="form-check mb-0">
          <input
            v-model="addressDisplayMode"
            class="form-check-input"
            type="radio"
            value="regular"
          />
          <span class="form-check-label">{{ $t("regular_address") }}</span>
        </label>
      </div>
      <hr class="my-4" />
      <div>
        <h5 class="mb-2">IPFS gateway</h5>
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
        <label class="form-label mt-3 mb-1" for="custom-ipfs-gateway">
          Custom gateway
        </label>
        <input
          id="custom-ipfs-gateway"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { addressDisplayMode } from "~/hooks/addressDisplay";
import { PUBLIC_IPFS_GATEWAYS, selectedIpfsGateway } from "~/module/ipfs";

const runtimeGateway = useRuntimeConfig().public.ipfsGateway;
</script>

<style scoped>
.settings-page {
  max-width: 900px;
}
</style>
