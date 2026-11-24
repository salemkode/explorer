import { computed, onScopeDispose, ref } from "vue";
import { MonitorHomeNetwork } from "~/module/chaingraph";
import { useNetworkStatus } from "./useNetworkStatus";

export function useHomeNetwork(network: string) {
	const now = ref(Date.now());
	const feed = useNetworkStatus(now);
	const subscription = useSubscription(
		MonitorHomeNetwork,
		{
			network,
			limit: 9,
			offset: 0,
		},
		{ fetchPolicy: "no-cache" },
	);
	const responseTimeout = ref<ReturnType<typeof setTimeout>>();
	function waitForResponse() {
		clearTimeout(responseTimeout.value);
		responseTimeout.value = setTimeout(feed.fail, 30_000);
	}
	waitForResponse();
	const resultListener = subscription.onResult(({ data }) => {
		if (data) {
			clearTimeout(responseTimeout.value);
			now.value = Date.now();
			feed.receive(data);
		}
	});
	const errorListener = subscription.onError(feed.fail);
	function reconnect() {
		feed.reconnect();
		waitForResponse();
	}
	const socket = useNuxtApp()._apolloWsClients?.default;
	const removeClosed = socket?.on("closed", reconnect);
	const removeError = socket?.on("error", reconnect);
	const timer = setInterval(() => {
		now.value = Date.now();
	}, 15_000);

	function retry() {
		feed.reconnect();
		subscription.stop();
		subscription.start();
		waitForResponse();
	}

	onScopeDispose(() => {
		clearInterval(timer);
		clearTimeout(responseTimeout.value);
		resultListener.off();
		errorListener.off();
		removeClosed?.();
		removeError?.();
	});

	const checkedAge = computed(() =>
		feed.updatedAt.value === undefined
			? "No update received"
			: `Last feed update: ${Math.max(0, Math.floor((now.value - feed.updatedAt.value) / 1000))}s ago`,
	);
	return { ...feed, checkedAge, retry };
}
