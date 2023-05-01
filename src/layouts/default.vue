<template>
  <div class="app">
    <header>
      <nav-search />
      <nav class="container d-flex justify-content-between my-3">
        <router-link class="navbar-brand d-flex align-items-center" to="/">
          <img src="/bch.svg" width="30" alt="" />
          <h5 class="my-0 mx-2">Bitcoin Cash Explorer</h5>
        </router-link>

        <ul class="nav">
          <li>
            <router-link
              class="navbar-brand d-flex align-items-center"
              to="registers"
            >
              <span class="my-0 mx-2" v-text="$t('registers')" />
            </router-link>
          </li>
          <li class="mx-1">
            <LazyDarkSwitch v-model="stateStore.darkmode" />
          </li>
        </ul>
      </nav>
    </header>
    <slot />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { useStateStore } from "~/store";

const stateStore = useStateStore();
watch(toRef(stateStore, "darkmode"), () => {
  const html = document.querySelector("html");

  html?.setAttribute("data-bs-theme", stateStore.darkmode ? "dark" : "light");
  html?.setAttribute("data-transition-switch", "true");
  setTimeout(() => html?.removeAttribute("data-transition-switch"), 500);
});
</script>

<style scoped>
.app {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.nav {
  align-items: center;
  gap: 5px;
}
</style>
