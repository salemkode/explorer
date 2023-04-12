<template>
  <Layout>
    <div class="m-auto p-md-5 p-sm-2 py-4 text-center">
      <img
        style="max-height: 300px; max-width: 85%"
        src="~/assets/images/error.svg"
      />
      <h3 class="mt-5">
        <b>{{ errorMsg }}</b>
      </h3>
      <div class="btn btn-primary">Go Home</div>
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
