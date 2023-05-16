<template>
  <div>
    <HomeHero />
    <div class="container">
      <HomeBlockChain />
      <div class="alert alert-light my-3" role="alert">
        The server of <a href="https://chaingraph.pat.mn">chaingraph.pat.mn</a>,
        on which the project is being developed, has stopped. I use
        <a href="https://demo.chaingraph.cash">demo.chaingraph.cash</a>
        temporarily.
      </div>
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
