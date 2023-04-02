<template>
  <div class="loading-container">
    <div class="loading">
      <h3 class="loading-text" v-text="$t('loading_dank_memes')" />
    </div>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading {
  position: relative;
}

.loading-text {
  color: white;
  mix-blend-mode: difference;
  margin: 0;
}

.loading::before {
  content: "";
  position: absolute;
  width: 50px;
  height: 100%;
  background: var(--bs-dark);
  transition: 1s all;
  left: 0;
  left: calc(100% - 50px);
  animation: 5s loading forwards infinite linear;
}

@keyframes loading {
  0% {
    left: 0;
    width: 50px;
  }
  20%,
  21% {
    width: 50px;
    left: calc(100% - 50px);
  }
  60% {
    width: 100%;
    left: 0px;
  }
  100% {
    left: 0px;
    width: 50px;
  }
}
</style>
