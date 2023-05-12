<template>
  <Layout>
    <div class="m-auto p-md-5 p-sm-2 py-4 text-center">
      <div class="error-image m-auto" />
      <h3 class="mt-2">
        <b>{{ errorMsg }}</b>
      </h3>
      <button
        class="btn btn-primary px-4"
        @click="clearError({ redirect: '/' })"
      >
        Go Home
      </button>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "~/layouts/default.vue";
const error = useError();
const errorMsg = computed(() => {
  const msg = error.value?.message || "";
  if (msg.startsWith("Page not found:")) {
    return "Page not found";
  }

  return msg;
});
</script>

<style scoped>
.error-image {
  height: 300px;
  max-height: 300px;
  max-width: 85%;
  background: url("~/assets/images/error.svg") no-repeat center;
  background-size: contain;
  transition: background-image 0.3s ease-in-out;
}

[data-bs-theme="dark"] .error-image {
  background-image: url("~/assets/images/error-dark.svg");
}
</style>
