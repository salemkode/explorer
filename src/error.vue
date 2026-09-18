<template>
  <NuxtLayout>
    <div class="mx-auto max-w-xl px-4 py-16 text-center">
      <div class="error-image mx-auto mb-6" />
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
        {{ errorMsg }}
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
        The page you are looking for does not exist or has been moved. Check the URL or return to home.
      </p>
      <button
        class="inline-flex items-center justify-center rounded-xl bg-bch-green px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all cursor-pointer"
        @click="goHome()"
      >
        <span class="icon-home mr-2 text-base" />
        Go Home
      </button>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const error = useError();

const errorMsg = computed(() => {
	const msg = error.value?.message || "";
	if (msg.startsWith("Page not found:")) {
		return "Page not found";
	}

	return msg;
});

const goHome = () => clearError({ redirect: "/" });
</script>

<style scoped>
.error-image {
  height: 280px;
  max-height: 280px;
  max-width: 85%;
  background: url("~/assets/images/error.svg") no-repeat center;
  background-size: contain;
  transition: background-image 0.3s ease-in-out;
}

:root.dark .error-image,
[data-bs-theme="dark"] .error-image {
  background-image: url("~/assets/images/error-dark.svg");
}
</style>
