<template>
  <div class="hero">
    <div>
      <h2 class="Title" v-text="$t('index_page_header')" />
      <p class="subheader">
        <span v-text="$t('index_page_subtext')" />
      </p>
      <div class="search-warp">
        <input
          v-model="searchKey"
          type="text"
          class="form-control form-control-md"
          placeholder="Search by Address / Transactions Id"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const searchKey = ref("");
</script>

<style scoped>
.hero {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 600px;
  color: white;
}
.hero::after,
.hero::before {
  content: "";
  inset: 0;
  left: 50%;
  position: absolute;
  transform: translate(-50%);
  height: 100%;
  width: 100vw;
  clip-path: inset(0 -100vmax);
}
.hero::after {
  z-index: -1;
  background: rgba(0, 0, 0, 0.5);
}
.hero::before {
  z-index: -2;
  background: url(~/assets/images/wallpaper.jpg) center;
  background-size: cover;
}

.hero > * {
  max-width: 800px;
  min-width: 75%;
}
</style>
