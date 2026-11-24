<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
        Chaingraph Server
      </h2>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="text-[11px] font-medium text-slate-500 dark:text-zinc-400 hover:underline cursor-pointer disabled:opacity-50"
          :disabled="checking"
          @click="checkAll"
        >
          {{ checking ? "Checking…" : "Check again" }}
        </button>
        <button
          v-if="active.custom"
          type="button"
          class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          @click="useServer('')"
        >
          Reset to Default
        </button>
      </div>
    </div>
    <p class="text-xs text-slate-500 dark:text-zinc-400">
      The GraphQL server the explorer reads blocks, transactions and tokens from.
      Your choice is saved in this browser; the page reloads to switch.
    </p>

    <ul class="space-y-2">
      <li v-for="server in servers" :key="server.httpUrl">
        <button
          type="button"
          class="w-full flex items-start justify-between gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer"
          :class="
            server.httpUrl === active.httpUrl
              ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs'
              : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40'
          "
          :aria-pressed="server.httpUrl === active.httpUrl"
          @click="server.httpUrl !== active.httpUrl && useServer(server.isDefault ? '' : server.httpUrl)"
        >
          <span class="min-w-0 space-y-1">
            <span class="flex flex-wrap items-center gap-1.5">
              <span
                class="text-xs font-semibold"
                :class="server.httpUrl === active.httpUrl ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-zinc-200'"
              >{{ server.name }}</span>
              <span
                v-if="server.isDefault"
                class="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
              >Default</span>
              <span
                v-if="server.httpUrl === active.httpUrl"
                class="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              >In use</span>
            </span>
            <span class="block text-[11px] font-mono text-slate-500 dark:text-zinc-400 break-all">{{ server.httpUrl }}</span>
            <ChaingraphProbeStatus :probe="probes[server.httpUrl]" :network="stateStore.network" />
          </span>
          <svg v-if="server.httpUrl === active.httpUrl" aria-hidden="true" class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </li>
    </ul>

    <form class="pt-1" novalidate @submit.prevent="testCustom">
      <label class="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5" :for="`${id}-custom-chaingraph`">
        Custom Server URL
      </label>
      <div class="flex gap-2">
        <input
          :id="`${id}-custom-chaingraph`"
          v-model="customUrl"
          class="min-w-0 flex-1 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 py-2.5 px-3.5 text-xs font-mono text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          type="url"
          placeholder="https://your-chaingraph.example/v1/graphql"
          spellcheck="false"
          autocomplete="off"
          @input="customProbe = undefined"
        />
        <button
          type="submit"
          class="shrink-0 rounded-xl px-3.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
          :disabled="!customUrl.trim() || customProbe?.status === 'checking'"
        >
          {{ customProbe?.status === "checking" ? "Checking…" : "Test & use" }}
        </button>
      </div>
      <p v-if="customError" class="text-[11px] text-red-600 dark:text-red-400 mt-1">{{ customError }}</p>
      <div v-else-if="customProbe && customProbe.status !== 'checking'" class="mt-1.5 space-y-1">
        <ChaingraphProbeStatus :probe="customProbe" :network="stateStore.network" />
        <button
          v-if="customProbe.status === 'offline' && customEndpoint"
          type="button"
          class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          @click="useServer(customEndpoint.httpUrl)"
        >
          Use it anyway
        </button>
      </div>
      <p v-else class="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
        A Chaingraph (Hasura) GraphQL URL. The <code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-[10px]">wss://</code>
        subscription URL is derived from it; an origin alone gets <code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-[10px]">/v1/graphql</code>.
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import {
	type ProbeState,
	PUBLIC_CHAINGRAPH_SERVERS,
	parseChaingraphUrl,
	probeChaingraph,
	saveChaingraphUrl,
} from "~/module/chaingraphServer";
import { useStateStore } from "~/store";

const id = useId();
const stateStore = useStateStore();
const config = useRuntimeConfig().public;
const defaultHttp = config.chaingraphHttp;
const active = useNuxtApp().$chaingraph ?? {
	httpUrl: defaultHttp,
	wsUrl: config.chaingraphWs,
	custom: false,
};

/** Known servers, the deployment default first, plus the active custom server. */
const servers = computed(() => {
	const list = PUBLIC_CHAINGRAPH_SERVERS.map((server) => ({
		name: server.name,
		httpUrl: server.httpUrl,
		isDefault: server.httpUrl === defaultHttp,
	}));
	if (!list.some((server) => server.isDefault))
		list.unshift({
			name: "Deployment default",
			httpUrl: defaultHttp,
			isDefault: true,
		});
	if (!list.some((server) => server.httpUrl === active.httpUrl))
		list.push({ name: "Custom", httpUrl: active.httpUrl, isDefault: false });
	return list.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
});

const probes = ref<Record<string, ProbeState>>({});
const checking = computed(() =>
	Object.values(probes.value).some((probe) => probe.status === "checking"),
);

const checkAll = () => {
	for (const { httpUrl } of servers.value) {
		probes.value[httpUrl] = { status: "checking" };
		probeChaingraph(httpUrl).then((result) => {
			probes.value[httpUrl] = result;
		});
	}
};
onMounted(checkAll);

const useServer = (httpUrl: string) => {
	saveChaingraphUrl(httpUrl);
	window.location.reload();
};

const customUrl = ref("");
const customProbe = ref<ProbeState>();
const customEndpoint = computed(() => parseChaingraphUrl(customUrl.value));
const customError = computed(() =>
	customUrl.value.trim() && !customEndpoint.value && customProbe.value
		? "Enter an https:// URL (plain http only works for localhost)."
		: "",
);

const testCustom = async () => {
	const endpoint = customEndpoint.value;
	if (!endpoint) {
		customProbe.value = { status: "offline", message: "Invalid URL" };
		return;
	}
	customProbe.value = { status: "checking" };
	const result = await probeChaingraph(endpoint.httpUrl);
	if (customEndpoint.value?.httpUrl !== endpoint.httpUrl) return;
	customProbe.value = result;
	if (result.status === "online" && result.networks.length > 0)
		useServer(endpoint.httpUrl === defaultHttp ? "" : endpoint.httpUrl);
};
</script>
