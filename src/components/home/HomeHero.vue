<template>
  <div class="hero">
    <div>
      <h2 class="Title" v-text="$t('index_page_header')" />
      <p class="subheader">
        <span v-text="$t('index_page_subtext')" />
      </p>
      <div class="search-hero input-group">
        <input
          v-model="searchValue"
          type="text"
          class="form-control form-control-md"
          placeholder="Search by Address / Transactions Id"
          @keydown="keydownHandler"
        />
        <button class="btn d-flex" type="button" @click="search">
          <img width="18" src="~/assets/icons/search.svg" class="search-icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~/store";
const appStore = useAppStore();

const searchValue = ref("");
function search() {
  appStore.search(searchValue.value);
}

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
  color: white;

  &::after,
  &::before {
    content: "";
    inset: 0;
    left: 50%;
    position: absolute;
    transform: translate(-50%);
    height: 100%;
    width: 100vw;
    clip-path: inset(0 -100vmax);
  }

  &::after {
    z-index: -1;
    background: rgba(0, 0, 0, 0.5);
  }

  &::before {
    z-index: -2;
    background: url(~/assets/images/wallpaper.jpg) center;
    background-size: cover;
  }

  > * {
    max-width: 800px;
    min-width: 75%;
  }

  .search-hero {
    width: 100%;
    display: flex;
    justify-content: center;
    background-color: white;
    border-radius: 5px;

    > :focus {
      box-shadow: none !important;
      border-color: black;
    }

    .btn:hover {
      align-items: center;
      color: black;
    }

    .search-icon {
      filter: invert(100%);
    }
  }
}
</style>
