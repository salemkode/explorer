<template>
  <div class="m-auto p-md-5 p-sm-2 py-4 text-center">
    <div class="error-image m-auto" />
    <h3 class="mt-2">
      <b>{{ errorMsg }}</b>
    </h3>
    <button
      class="btn btn-primary px-4"
      @click="goHome()"
    >
      Go Home
    </button>
  </div>
</template>

<script setup lang="ts">
type HttpErrorState = { statusCode?: number; message?: string };

const router = useRouter();

const errorMsg = computed(() => {
	const state = history.state?.httpError as HttpErrorState | undefined;
	return state?.message || "Page not found";
});

const goHome = () => router.push("/");
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
