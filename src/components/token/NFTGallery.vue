<template>
  <div
    v-if="loading || error || items.length"
    class="card"
  >
    <h3 class="d-flex align-items-center p-3 header">
      <span>{{ $t("nft_gallery") }}</span>
      <div class="mx-auto" />
      <BasePagination
        v-show="hasPrevPage || hasNextPage"
        :has-prev-page="hasPrevPage"
        :has-next-page="hasNextPage"
        @next="emit('next')"
        @previous="emit('previous')"
      />
    </h3>

    <div v-if="error" class="m-auto py-5 my-5">
      {{ error }}
    </div>

    <div v-else class="p-3">
      <div class="gallery-grid">
        <article
          v-for="item in items"
          :key="`${item.category}:${item.capability || 'none'}:${item.commitment || ''}`"
          class="nft-card border rounded p-3"
        >
          <div class="image-wrap mb-3">
            <bcmr-icon
              :token-category="item.category"
              :capability="item.capability || undefined"
              :commitment="item.commitment"
              :size="160"
              class="image"
            />
          </div>
          <div class="fw-semibold text-truncate mb-2" :title="item.name">{{ item.name }}</div>

          <div class="mb-2">
            <div class="small text-secondary">{{ $t("category") }}</div>
            <BaseCopy :text="item.category" :copy="true" :short="true" />
          </div>

          <div>
            <div class="small text-secondary">{{ $t("commitment") }}</div>
            <BaseCopy :text="item.commitment || 'N/A'" :copy="!!item.commitment" :short="true" />
          </div>
        </article>
      </div>
    </div>

    <LoadingSpinner
      v-if="loading"
      :class="loading && !items.length ? 'py-5 my-5' : 'py-2 mt-2'"
    />
  </div>
</template>

<script setup lang="ts">
import type { Capability } from "~/types";

export interface ChildNftItem {
  category: string;
  capability?: Capability | null;
  commitment: string;
  address?: string;
  name: string;
}

defineProps<{
  items: ChildNftItem[];
  loading: boolean;
  error?: string;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}>();

const emit = defineEmits<{
  (event: "next"): void;
  (event: "previous"): void;
}>();
</script>

<style lang="scss" scoped>
.gallery-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 576px) {
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 992px) {
  .gallery-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1400px) {
  .gallery-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.nft-card {
  min-width: 0;
}

.image-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image {
  display: block;
}
</style>
