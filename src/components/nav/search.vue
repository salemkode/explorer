<template>
  <Transition name="slider">
    <div v-if="openFromOtherHomePage" class="search-bar container">
      <img
        width="18"
        src="~/assets/icons/search.svg"
        class="me-2"
        @click="search"
      />
      <input
        v-model="searchValue"
        type="text"
        :placeholder="$t('search_placeholder')"
        @keydown="keydownHandler"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
const route = useRoute();

const openFromOtherHomePage = computed(() => route.fullPath !== "/");

const searchValue = ref("");
function search() {
  searchValue.value = "";
}

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
  box-shadow: 0 0 0 100vmax;
  clip-path: inset(0 -100vmax);
}

.search-bar i {
  color: white;
  cursor: pointer;
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
