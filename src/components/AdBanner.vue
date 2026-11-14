<script setup lang="ts">
export interface SponsorInfo {
	title: string;
	description: string;
	link: string;
	ctaText?: string;
	imageUrl?: string;
	badge?: string;
}

const props = withDefaults(
	defineProps<{
		slotId?: string;
		title?: string;
		description?: string;
		ctaText?: string;
		telegramUsername?: string;
		telegramUrl?: string;
		xUsername?: string;
		xUrl?: string;
		emailAddress?: string;
		emailUrl?: string;
		articleUrl?: string;
		dismissible?: boolean;
		sponsor?: SponsorInfo | null;
	}>(),
	{
		slotId: "banner",
		title: "",
		description: "",
		ctaText: "",
		telegramUsername: "salemkode",
		telegramUrl: "https://t.me/salemkode",
		xUsername: "salemkode",
		xUrl: "https://x.com/salemkode",
		emailAddress: "hello@salemkode.com",
		emailUrl:
			"mailto:hello@salemkode.com?subject=Advertising%20%2F%20Sponsorship%20Inquiry%20-%20Bitcoin%20Cash%20Explorer",
		articleUrl: "/sponsor",
		dismissible: true,
		sponsor: null,
	},
);

const isDismissed = ref(false);

const storageKey = computed(() => `bch_explorer_ad_dismissed_${props.slotId}`);

onMounted(() => {
	if (typeof window !== "undefined" && props.dismissible) {
		try {
			const stored = sessionStorage.getItem(storageKey.value);
			if (stored === "true") {
				isDismissed.value = true;
			}
		} catch {
			// Ignore storage access errors
		}
	}
});

const dismiss = () => {
	isDismissed.value = true;
	if (typeof window !== "undefined" && props.dismissible) {
		try {
			sessionStorage.setItem(storageKey.value, "true");
		} catch {
			// Ignore storage access errors
		}
	}
};
</script>

<template>
  <aside
    v-if="!isDismissed"
    :aria-label="$t('ad_banner_aria_label', 'Advertisement')"
    class="relative w-full rounded-2xl overflow-hidden border border-emerald-500/25 dark:border-emerald-500/20 bg-gradient-to-r from-emerald-50/70 via-white dark:via-zinc-900 to-teal-50/60 dark:from-emerald-950/20 dark:to-zinc-900/90 p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-emerald-500/40"
  >
    <!-- Background subtle ambient glow -->
    <div class="absolute -right-10 -bottom-10 w-44 h-44 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

    <!-- Top strip with badge & links -->
    <div class="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {{ sponsor ? (sponsor.badge || $t('ad_sponsored', 'Sponsored')) : $t('ad_spot_available', 'Ad Space Available') }}
        </span>
        <span class="text-[11px] text-slate-400 dark:text-zinc-500 hidden sm:inline">
          Leaderboard Slot
        </span>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Article Link -->
        <NuxtLink
          :to="articleUrl"
          class="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ $t('ad_why_funding', 'Why we need funding') }}</span>
          <span class="text-[10px]">→</span>
        </NuxtLink>

        <!-- Dismiss Button -->
        <button
          v-if="dismissible"
          type="button"
          class="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          :aria-label="$t('ad_dismiss', 'Dismiss ad')"
          @click="dismiss"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Active Sponsor Mode -->
    <div v-if="sponsor" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5 min-w-0">
        <img
          v-if="sponsor.imageUrl"
          :src="sponsor.imageUrl"
          :alt="sponsor.title"
          class="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-zinc-800 shrink-0"
        />
        <div class="min-w-0">
          <h3 class="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
            {{ sponsor.title }}
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 line-clamp-2">
            {{ sponsor.description }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <a
          :href="sponsor.link"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all duration-150"
        >
          <span>{{ sponsor.ctaText || $t('ad_visit_site', 'Learn More') }}</span>
          <span class="text-xs">↗</span>
        </a>
      </div>
    </div>

    <!-- Advertise Space Invitation Mode (Default) -->
    <div v-else class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div class="flex items-start sm:items-center gap-3.5 min-w-0">
        <!-- Megaphone / Announcement Icon -->
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </div>

        <div class="min-w-0">
          <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {{ title || $t('ad_banner_title', 'Advertise on Bitcoin Cash Explorer') }}
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
            {{ description || $t('ad_banner_desc', 'Reach thousands of Bitcoin Cash & CashTokens users, holders, and developers.') }}
          </p>
        </div>
      </div>

      <!-- Contact Channels: Telegram, X.com, Email + Read Article -->
      <div class="flex flex-wrap items-center gap-2 shrink-0 pt-1 lg:pt-0">
        <!-- Telegram Link -->
        <a
          :href="telegramUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-zinc-700 hover:border-emerald-500/40 text-xs font-semibold shadow-2xs transition-all"
          :title="`Text on Telegram: @${telegramUsername}`"
        >
          <svg class="w-3.5 h-3.5 fill-current text-sky-500" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
          </svg>
          <span>Telegram</span>
        </a>

        <!-- X.com Link -->
        <a
          :href="xUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-zinc-700 hover:border-emerald-500/40 text-xs font-semibold shadow-2xs transition-all"
          :title="`Text on X.com: @${xUsername}`"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span>X.com</span>
        </a>

        <!-- Email Link -->
        <a
          :href="emailUrl"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-zinc-700 hover:border-emerald-500/40 text-xs font-semibold shadow-2xs transition-all"
          :title="`Email: ${emailAddress}`"
        >
          <svg class="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <span>Email</span>
        </a>

        <!-- Why Funding / Read Article Action Button -->
        <NuxtLink
          :to="articleUrl"
          class="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-xs hover:shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <span>{{ $t('ad_read_article', 'Read Article') }}</span>
          <span class="text-xs">→</span>
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>
