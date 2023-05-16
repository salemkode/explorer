<template>
  <div>
    <HomeHero />
    <div class="container">
      <HomeBlockChain />
      <div class="home-content d-lg-grid my-3">
        <HomeUnconfirmedTransaction />
        <div class="mt-2 mt-lg-0">
          <HomeBlocksList />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-content {
  grid-template-columns: 1.5fr 1fr;
  gap: 15px;
}
</style>
