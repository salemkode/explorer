<template>
  <Transition name="slider">
    <div v-if="!isHomePage" class="search-bar container">
      <i class="uicon-search me-2 text-white pointer" @click="search" />
      <input
        v-model="query"
        type="text"
        :placeholder="$t('search_placeholder')"
        @keydown="keydownHandler"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useSearch } from "~/hooks/search";
const route = useRoute();

const isHomePage = computed(() => route.fullPath === "/");
const { query, search } = useSearch();

function keydownHandler(event: KeyboardEvent) {
  if (event.key === "Enter") {
    search();
  }
}
</script>

<style scoped>
input:focus,
button:focus {
  box-shadow: none !important;
}

.search-bar {
  display: flex;
  background: var(--bs-dark);
  max-height: 200px;
  box-shadow: 0 0 0 100vmax var(--bs-dark);
  clip-path: inset(0 -100vmax);
}

.search-bar input {
  background: transparent;
  border: none;
  padding: 5px;
  width: 100%;
  color: white;
  outline: none;
}

.search-bar input::placeholder {
  color: white;
}

.slider-enter-active,
.slider-leave-active {
  transition: max-height 1s;
}

.slider-leave-from,
.slider-enter-to {
  max-height: 100px;
}

.slider-enter-from,
.slider-leave-to {
  max-height: 0;
}
</style>
