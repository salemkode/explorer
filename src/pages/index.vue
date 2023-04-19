<template>
  <div>
    <HomeHero />
    <div class="container">
      <HomeBlocks />
      <div class="home-content container d-lg-grid">
        <HomeUnconfirmedTransaction />
        <HomeBlocksList />
      </div>
    </div>
  </div>
</template>

<style>
body {
  overflow-x: hidden;
  width: 100vw;
}

.home-content {
  grid-template-columns: 1.5fr 1fr;
  gap: 5px;
}
</style>
