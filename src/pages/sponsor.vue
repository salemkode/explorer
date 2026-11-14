<script setup lang="ts">
import BaseCopy from "~/components/BaseCopy.vue";
import VueQrCode from "~/components/VueQrCode.vue";

definePageMeta({
	alias: ["/advertise", "/why-funding"],
});

useHead({
	title: "Why We Need Funding — Bitcoin Cash Explorer",
	meta: [
		{
			name: "description",
			content:
				"Thanking the people who made Bitcoin Cash Explorer possible, and explaining how direct sponsorships can support its maintenance and shared infrastructure.",
		},
	],
});

const contactChannels = [
	{
		name: "Telegram",
		handle: "@salemkode",
		url: "https://t.me/salemkode",
		description:
			"Instant messaging for ad placements, questions, and discussions.",
		actionLabel: "Message on Telegram",
		icon: "telegram",
	},
	{
		name: "X.com",
		handle: "@salemkode",
		url: "https://x.com/salemkode",
		description:
			"Direct message for sponsorship inquiries, community updates, or partnerships.",
		actionLabel: "Message on X.com",
		icon: "x",
	},
	{
		name: "Email",
		handle: "hello@salemkode.com",
		url: "mailto:hello@salemkode.com?subject=Bitcoin%20Cash%20Explorer%20Sponsorship%20Inquiry",
		description:
			"For formal proposals, custom integration requests, or long-term sponsorships.",
		actionLabel: "Send Email",
		icon: "email",
		copyValue: "hello@salemkode.com",
	},
];

const donationAddress =
	"bitcoincash:qp0yrpmemusnkzk07ngt790hg8cts7rm2q5lcau9r8";

</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
    <!-- Breadcrumb / Back link -->
    <div class="flex items-center justify-between">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
      >
        <span>←</span>
        <span>Back to Explorer</span>
      </NuxtLink>

      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Public Good Infrastructure
      </span>
    </div>

    <!-- Article Header -->
    <header class="space-y-4 border-b border-slate-200 dark:border-zinc-800 pb-8">
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
        Why We Need Funding
      </h1>
      <p class="text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
        This explorer began with community support. As it grows, I want to give something back to the people who keep it running—and find a sustainable way to keep improving it.
      </p>

      <div class="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
            S
          </div>
          <span class="font-medium text-slate-700 dark:text-zinc-200">Salem Kode</span>
          <span class="text-slate-400 dark:text-zinc-600">•</span>
          <span>Developer</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-slate-400 dark:text-zinc-600">•</span>
          <span>Open Source</span>
          <span class="text-slate-400 dark:text-zinc-600">•</span>
          <span>Community Supported</span>
        </div>
      </div>
    </header>

    <!-- Main Article Body -->
    <main class="space-y-12">
      <article class="space-y-10 text-base leading-relaxed text-slate-600 dark:text-zinc-300 [&_a]:text-emerald-600 dark:[&_a]:text-emerald-400 [&_a]:underline [&_a]:underline-offset-2">
        <section class="space-y-4">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">First, thank you</h2>
          <p>Before I talk about funding, I want to remember how this project started. The 2023 Flipstarter campaign gave me the support to begin building this Bitcoin Cash explorer. People believed in the idea while it was still taking shape, and helped turn it into something the community could use.</p>
          <p>I am proud of what we have built, and grateful to everyone who supported that campaign. When you use the explorer today, you are seeing something that those early supporters helped make possible. Thank you for trusting me with it.</p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Thank you, Pat, for the infrastructure behind it</h2>
          <p>There is another person I want to thank: <a href="https://github.com/mainnet-pat" target="_blank" rel="noopener noreferrer">Pat</a>, a developer behind <a href="https://github.com/mainnet-cash/mainnet-js" target="_blank" rel="noopener noreferrer">mainnet.js</a> and someone who has contributed a great deal to the Bitcoin Cash community. Pat hosts the Chaingraph service used by this explorer’s default configuration, at <code class="break-all">gql.chaingraph.pat.mn</code>. His <a href="https://gist.github.com/mainnet-pat/95df7e844987af8ca4bebbff90f1f625" target="_blank" rel="noopener noreferrer">development updates</a> also describe helping me build token queries when the explorer was getting started.</p>
          <p><a href="https://github.com/bitauth/chaingraph" target="_blank" rel="noopener noreferrer">Chaingraph</a> indexes blockchain data into PostgreSQL and exposes it through a GraphQL API. This explorer uses that API to look up blocks, transactions, address histories, and CashTokens data, including token categories and the transaction chains used to find BCMR metadata. Pat hosts an instance of this open-source software; the credit for creating Chaingraph belongs to its own developers.</p>
          <p>It is easy to notice the interface and overlook the service behind it. But Pat’s hosting supports core functionality that makes this explorer useful. I appreciate his work and generosity, and I want that contribution to be visible in the app’s Settings as well.</p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Keeping the project moving</h2>
          <p>I now work full-time outside this project. I still care about the explorer, and I continue to make improvements when I can: a small feature, a fix, a clearer screen, or a better interface. Those changes add up, but maintaining the project as well as I would like takes more time than I currently have available.</p>
          <p>I have never been comfortable returning to crowdfunding again and again. The 2023 campaign made a real difference, and I remain thankful for it. For the next stage, I would like to build a steadier source of support through direct sponsorships.</p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">The explorer is growing</h2>
          <p>In the Cloudflare Workers &amp; Pages metrics captured on October 2, 2026, the explorer recorded <strong>6.71 million asset requests over the previous 30 days</strong>. Seeing that activity makes me happy: the project has grown far beyond its first steps.</p>
          <p>That figure measures requests for website assets. It does not mean 6.71 million visitors, page views, or advertising impressions: one page can load several assets, and automated traffic can also generate requests. For sponsorship discussions, I want to be clear about what each number actually measures.</p>
          <figure class="space-y-2">
            <a href="/sponsorship-traffic-2026-10-02.png" target="_blank" rel="noopener noreferrer" aria-label="Open Cloudflare traffic screenshot">
              <img src="/sponsorship-traffic-2026-10-02.png" width="2278" height="933" loading="lazy" alt="Cloudflare explorer metrics showing 6.71 million asset requests over the last 30 days, captured October 2, 2026" class="w-full rounded-xl border border-slate-200 dark:border-zinc-800" />
            </a>
            <figcaption class="text-xs text-slate-500 dark:text-zinc-400">Cloudflare metrics, captured October 2, 2026. This is a dated snapshot.</figcaption>
          </figure>
          <p>We also use <a href="https://developers.cloudflare.com/web-analytics/data-metrics/" target="_blank" rel="noopener noreferrer">Cloudflare Web Analytics</a> to understand visits and page views. Those are separate metrics that can help us explain the explorer’s audience to potential sponsors.</p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Support for the explorer—and the wider ecosystem</h2>
          <p>Sponsorship revenue could help improve the explorer’s hosting and give me more room to maintain and develop it. I would also like it to make supporting Pat’s Chaingraph hosting possible, including better server capacity when needed. That is a goal for future revenue, rather than a claim that we already fund his service.</p>
          <p>The point is support for <strong>Chaingraph infrastructure serving Bitcoin Cash mainnet</strong>. It would benefit more than this explorer: other projects use Pat’s public service too. Helping shared infrastructure can help the wider Bitcoin Cash ecosystem.</p>
          <p>Running Chaingraph means maintaining an indexer, a database, and connections to full nodes. Storing and querying blockchain history takes resources and ongoing care. In my experience, replacing the richer CashTokens queries we depend on would be difficult. Other tools exist, and someone may eventually build a lighter or cheaper approach, but today this service is an important part of how the explorer works.</p>
          <p>If you can help Pat directly with hosting, server resources, or infrastructure work, please <a href="https://github.com/mainnet-pat" target="_blank" rel="noopener noreferrer">reach out to him</a>. His contribution deserves support in its own right.</p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Sponsorships that fit my values</h2>
          <p>The explorer offers a place for companies and projects to introduce useful services to people exploring Bitcoin Cash. A wallet, a merchant service, a developer tool, or another relevant business may find value here. Sponsors do not have to be Bitcoin Cash projects, as long as their offering is suitable for our users and fits the principles below.</p>
          <p>I want to work directly with sponsors. I do not plan to use Google AdSense because I have concerns about using that service and want to choose which businesses appear here.</p>
          <p>I am Muslim, so the services I advertise must be compatible with Islamic principles. I will review sponsorship proposals individually. I will not accept promotions for gambling, alcohol, pornography, or interest-based lending. A sponsorship must be something I can responsibly put in front of the community.</p>
          <p>Paid placements will be clearly marked as sponsored. If your service fits, contact me so we can discuss the placement, duration, and price. I want an arrangement that gives sponsors useful exposure while helping keep the explorer available and improving for everyone.</p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Thank you for helping it continue</h2>
          <p>To the 2023 Flipstarter supporters, to Pat, and to everyone who uses the explorer, reports a problem, or suggests an improvement: thank you. You have all helped this project move forward.</p>
          <p>If you would like to sponsor the explorer or help with its infrastructure, I would be happy to hear from you. My hope is to turn the project’s growth into lasting support for the explorer and the shared tools it depends on.</p>
        </section>
      </article>

      <!-- Section 5: Contact Channels (Telegram, X.com, Email) -->
      <section class="space-y-6 pt-4">
        <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <span class="w-2 h-2 rounded-full bg-emerald-500" />
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Contact Me About Sponsorships or Support
          </h2>
        </div>
        <p class="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed">
          I am always open to discuss ad spaces, partnerships, community feedback, or feature suggestions. Feel free to text me directly through your preferred channel:
        </p>

        <!-- 3 Contact Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="channel in contactChannels"
            :key="channel.name"
            class="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <svg v-if="channel.icon === 'telegram'" class="w-5 h-5 text-sky-500 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  <svg v-else-if="channel.icon === 'x'" class="w-5 h-5 fill-current text-slate-900 dark:text-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <svg v-else-if="channel.icon === 'email'" class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  {{ channel.name }}
                </span>
                <span class="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  {{ channel.handle }}
                </span>
              </div>
              <p class="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {{ channel.description }}
              </p>
            </div>

            <div class="pt-2">
              <a
                :href="channel.url"
                :target="channel.icon === 'email' ? undefined : '_blank'"
                :rel="channel.icon === 'email' ? undefined : 'noopener noreferrer'"
                class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>{{ channel.actionLabel }}</span>
                <span class="text-xs">↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 6: Direct Bitcoin Cash Donation Section -->
      <section class="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-white dark:via-zinc-900 to-teal-500/10 p-6 sm:p-8 space-y-6 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Direct Contribution
            </span>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">
              Donate Directly in Bitcoin Cash
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-xl">
              Your contribution supports the explorer’s maintenance and future improvements. Thank you for helping the project continue!
            </p>
          </div>
        </div>

        <div class="flex flex-col md:flex-row items-center gap-6 bg-white/80 dark:bg-zinc-950/60 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <div class="shrink-0 p-2 bg-white rounded-xl shadow-xs">
            <VueQrCode :content="donationAddress" :size="120" />
          </div>

          <div class="min-w-0 flex-1 space-y-3 w-full">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              BCH Donation Address
            </div>
            <div class="p-3 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono text-xs sm:text-sm text-slate-800 dark:text-zinc-200 break-all select-all flex items-center justify-between gap-2">
              <span class="break-all">{{ donationAddress }}</span>
              <BaseCopy :text="donationAddress" :copy="true" />
            </div>
            <p class="text-xs text-slate-500 dark:text-zinc-400">
              This address supports the explorer. To support Pat’s hosting directly, please contact him separately.
            </p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
