<template>
  <div class="hero">
    <div class="container">
      <h2 class="Title" v-text="$t('index_page_header')" />
      <p class="subheader">
        <span v-text="$t('index_page_subtext')" />
      </p>
      <div class="search-hero input-group">
        <input
          v-model="query"
          type="text"
          class="form-control form-control-md"
          placeholder="Search by Address / Transactions Id"
          @keydown="keydownHandler"
        />
        <button class="btn d-flex" type="button" @click="search">
          <i class="uicon-search" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSearch } from "~/hooks/search";
const { query, search } = useSearch();

function keydownHandler(event: KeyboardEvent) {
  if (event.key === "Enter") {
    search();
  }
}
</script>

<style lang="scss" scoped>
.hero {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 600px;
  overflow: hidden;
  color: white;

  &::after,
  &::before {
    content: "";
    inset: 0;
    left: 0;
    position: absolute;
    height: 100%;
    width: 100vw;
    width: 100dvw;
    clip-path: inset(0 -100vmax);
  }

  &::after {
    z-index: -1;
    background: rgba(0, 0, 0, 0.5);
  }

  &::before {
    z-index: -2;
    background: url(~/assets/images/wallpaper.webp) center;
    background-size: cover;
  }

  .search-hero {
    width: 100%;
    display: flex;
    justify-content: center;
    background-color: transparent;
    border-radius: 5px;

    :focus {
      box-shadow: none !important;
      border-color: var(--bs-body-color) !important;
    }

    .btn {
      align-items: center;
      border: calc(var(--bs-border-width) + 0.5px) solid var(--bs-border-color);
      background: var(--bs-body-bg);
    }
  }
}
</style>
