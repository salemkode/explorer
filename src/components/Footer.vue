<template>
  <footer class="mt-auto border-t border-slate-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xs transition-colors">
    <!-- Main Footer Links -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
        <!-- Source Code -->
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4" v-text="$t('footer_source_code')" />
          <ul class="space-y-2.5">
            <li v-for="item in sourceCodeList" :key="item.title">
              <a
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
              >
                <span>{{ item.title }}</span>
                <span class="text-xs opacity-60">↗</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Resources -->
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4">
            Resources
          </h4>
          <ul class="space-y-2.5">
            <li v-for="resource in resources" :key="resource.title">
              <a
                :href="resource.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
              >
                <span>{{ resource.title }}</span>
                <span class="text-xs opacity-60">↗</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Connect -->
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4" v-text="$t('footer_connect')" />
          <ul class="space-y-2.5">
            <li v-for="connectItem in connectList" :key="connectItem.title">
              <a
                :href="connectItem.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
              >
                <span>{{ connectItem.title }}</span>
                <span class="text-xs opacity-60">↗</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Copyright Bar -->
    <div class="border-t border-slate-200/60 dark:border-zinc-800/60 bg-slate-50/80 dark:bg-zinc-900/40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400">
        <p class="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
          <span>Bitcoincash Explorer © {{ new Date().getFullYear() }}</span>
          <span class="text-slate-300 dark:text-zinc-700">•</span>
          <span>Made by</span>
          <a
            class="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            href="https://salemkode.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            SalemKode
          </a>
        </p>
        <a
          href="https://explorer-flipstarter.salemkode.com/"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <span>Funded by Bitcoin Cash Community</span>
          <span class="text-xs">↗</span>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const sourceCodeList = [
	{
		title: "Explorer",
		url: "https://github.com/salemkode/explorer",
	},
	{
		title: "Chaingraph",
		url: "http://chaingraph.cash/",
	},
];

const resources = [
	{
		title: "CashToken",
		url: "https://github.com/bitjson/cashtokens",
	},
	{
		title: "BCMR",
		url: "https://github.com/bitjson/chip-bcmr",
	},
	{
		title: "CashToken Ecosystem",
		url: "https://minisatoshi.cash/ecosystem?filter=CashToken",
	},
];

const connectList = [
	{
		title: "Explorer developer",
		url: "https://t.me/salemkode",
	},
	{
		title: "Bitcoin cash",
		url: "https://t.me/bchchannel",
	},
	{
		title: "CashToken",
		url: "https://t.me/cashtoken_devs",
	},
	{
		title: "Chaingraph dev",
		url: "https://t.me/chaingraph_dev",
	},
];
</script>
