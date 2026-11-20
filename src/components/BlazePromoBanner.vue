<script setup lang="ts">
import { useStorage } from "~/hooks/storage";
import {
	BLAZE_PROMO_STORAGE_KEY,
	type BlazePromoConfig,
	blazePromoDismissKey,
	shouldShowBlazePromo,
} from "~/module/blazePromo";

const runtimeConfig = useRuntimeConfig();
const promo = computed(
	() =>
		runtimeConfig.public?.features?.blazePromo as
			| Partial<BlazePromoConfig>
			| undefined,
);
const dismissedId = useStorage<string | null>(BLAZE_PROMO_STORAGE_KEY, null);

const visible = computed(() =>
	shouldShowBlazePromo(promo.value, dismissedId.value),
);

const dismiss = () => {
	if (promo.value) dismissedId.value = blazePromoDismissKey(promo.value);
};
</script>

<template>
  <aside
    v-if="visible"
    :aria-label="$t('blaze_promo_label')"
    class="w-full border-b border-orange-200/80 dark:border-orange-900/60 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-orange-950/40 dark:via-zinc-950 dark:to-orange-950/40 text-xs sm:text-sm"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-2 flex items-center gap-2 sm:gap-3">
      <p class="flex-1 min-w-0 truncate text-slate-700 dark:text-zinc-300 leading-snug">
        {{ $t("blaze_promo_text") }}
        <a
          :href="promo?.url"
          target="_blank"
          rel="noopener noreferrer"
          class="ml-1 inline-flex items-center gap-1 rounded-sm font-semibold text-orange-700 dark:text-orange-400 underline underline-offset-2 hover:text-orange-800 dark:hover:text-orange-300 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        >
          {{ $t(promo?.projectPage ? "blaze_promo_cta_project" : "blaze_promo_cta_app") }}
          <span aria-hidden="true">↗</span>
        </a>
      </p>
      <button
        type="button"
        class="shrink-0 inline-flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-md text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 hover:text-slate-800 hover:bg-orange-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        :aria-label="$t('blaze_promo_dismiss')"
        @click="dismiss"
      >
        <span aria-hidden="true" class="text-lg sm:text-xl leading-none">×</span>
      </button>
    </div>
  </aside>
</template>
