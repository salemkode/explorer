<template>
  <div class="app">
    <BaseHeader />
    <slot />
    <Footer />
  </div>
</template>

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
