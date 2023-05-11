<script setup lang="ts">
import { useStateStore } from "~/store";

const openNav = ref(false);
const navItems = [{ name: "registers", path: "/registers" }];
const stateStore = useStateStore();
</script>

<template>
  <header>
    <nav-search />
    <nav class="container d-flex flex-wrap justify-content-between my-3">
      <!-- First row -->
      <div class="d-flex justify-content-between align-items-center w-100">
        <router-link class="navbar-brand d-flex align-items-center" to="/">
          <img src="/bch.svg" width="30" height="30" alt="" />
          <h5 class="my-0 mx-2">Bitcoin Cash Explorer</h5>
        </router-link>

        <i class="uicon-menu d-md-none" @click="openNav = !openNav" />

        <ul class="nav d-md-flex d-none align-items-center gap-2">
          <li v-for="item in navItems" :key="item.name">
            <router-link class="navbar-brand d-flex" :to="item.path">
              <span class="my-0 mx-2" v-text="$t(item.name)" />
            </router-link>
          </li>
          <li class="mx-1">
            <LazyDarkSwitch />
          </li>
        </ul>
      </div>

      <!-- Mobile menu -->
      <div class="d-grid d-md-none flex-column gap-2 nav w-100 text-center">
        <SliderUpDown :active="openNav">
          <ul class="nav d-grid gap-2 d-md-none card p-2 mt-3">
            <li v-for="item in navItems" :key="item.name">
              <router-link
                class="btn btn-primary d-flex align-items-center"
                :to="item.path"
              >
                <span class="my-0 mx-2" v-text="$t(item.name)" />
              </router-link>
            </li>
            <li
              class="mx-1 d-flex justify-content-between align-items-center btn"
              @click="stateStore.darkmode = !stateStore.darkmode"
            >
              <span v-text="$t('appearance')" />
              <LazyDarkSwitch @click.stop />
            </li>
          </ul>
        </SliderUpDown>
      </div>
    </nav>
  </header>
</template>
