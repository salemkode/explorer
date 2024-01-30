<template>
  <div class="app">
    <BaseHeader />
    <div class="d-grid">
      <slot />
    </div>
    <Footer />
  </div>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
</style>
