<template>
  <div>
    <HomeHero />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10 pb-16">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div class="lg:col-span-7 xl:col-span-8">
          <HomeUnconfirmedTransaction />
        </div>
        <div class="lg:col-span-5 xl:col-span-4">
          <HomeBlocksList />
        </div>
      </div>
    </div>
  </div>
</template>
