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
        <IpfsGatewaySettings />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { addressDisplayMode } from "~/hooks/addressDisplay";
</script>

<style scoped>
.settings-page {
  max-width: 900px;
}
</style>
