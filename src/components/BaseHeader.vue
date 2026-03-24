<script setup lang="ts">
const openNav = ref(false);
const openSettings = ref(false);
const navItems = [
	{ name: "registers", path: "/registers" },
	{ name: "converter", path: "/converter" },
	{ name: "doctor", path: "/doctor" },
];
</script>

<template>
  <header>
    <nav-search />
    <nav class="container d-flex flex-wrap justify-content-between my-3 app-nav">
      <!-- First row -->
      <div class="d-flex justify-content-between align-items-center w-100">
        <router-link class="brand-link d-flex align-items-center" to="/">
          <img src="/bch.svg" width="30" height="30" alt="" />
          <span class="brand-text">Bitcoin Cash Explorer</span>
        </router-link>

        <i class="uicon-menu d-md-none menu-toggle" @click="openNav = !openNav" />

        <ul class="nav d-md-flex d-none align-items-center gap-2 desktop-nav">
          <li v-for="item in navItems" :key="item.name">
            <router-link class="nav-link-text d-flex" :to="item.path">
              <span v-text="$t(item.name)" />
            </router-link>
          </li>
          <li>
            <button class="btn btn-sm nav-link-text settings-trigger" @click="openSettings = true">
              {{ $t("settings") }}
            </button>
          </li>
          <li class="mx-1">
            <LazyDarkSwitch />
          </li>
        </ul>
      </div>

      <!-- Mobile menu -->
      <div class="d-grid d-md-none flex-column gap-2 nav w-100 text-center mobile-nav-wrap">
        <SliderUpDown :active="openNav">
          <ul class="nav d-grid gap-2 d-md-none card p-2 mt-3">
            <li v-for="item in navItems" :key="item.name">
              <router-link
                class="btn d-flex align-items-center justify-content-center mobile-nav-link"
                :to="item.path"
              >
                <span v-text="$t(item.name)" />
              </router-link>
            </li>
            <li
              class="mx-1 d-flex justify-content-between align-items-center btn mobile-nav-link"
            >
              <span v-text="$t('appearance')" />
              <LazyDarkSwitch @click.stop />
            </li>
            <li>
              <router-link
                class="btn d-flex align-items-center justify-content-center mobile-nav-link"
                to="/settings"
              >
                <span v-text="$t('settings')" />
              </router-link>
            </li>
          </ul>
        </SliderUpDown>
      </div>

      <AddressDisplaySettingsDialog
        :open="openSettings"
        class="d-none d-md-block"
        @close="openSettings = false"
      />
    </nav>
  </header>
</template>

<style scoped>
.app-nav {
  row-gap: 12px;
}

.btn {
  --bs-btn-active-border-color: transparent;
}

.brand-link {
  color: inherit;
  gap: 10px;
  text-decoration: none;
}

.brand-text {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.1;
}

.desktop-nav,
.mobile-nav-wrap {
  font-size: 0.95rem;
  font-weight: 600;
}

.nav-link-text {
  align-items: center;
  border-radius: 999px;
  color: var(--bs-body-color);
  min-height: 38px;
  padding: 0 14px;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.nav-link-text:hover,
.mobile-nav-link:hover,
.settings-trigger:hover {
  background: rgba(var(--bs-body-color-rgb), 0.08);
}

.router-link-active.nav-link-text,
.router-link-exact-active.nav-link-text {
  background: rgba(var(--bs-body-color-rgb), 0.12);
}

.settings-trigger {
  border: 0;
}

.menu-toggle {
  cursor: pointer;
  font-size: 22px;
}

.mobile-nav-link {
  font-size: 0.95rem;
  font-weight: 600;
  min-height: 42px;
}
</style>
