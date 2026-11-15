import { computed, type Ref, ref, shallowRef } from "vue";
import type { MonitorHomeNetworkSubscription } from "~/graphql/graphql";

export const FEED_STALE_AFTER = 5 * 60 * 1000;
export const BLOCK_STALE_AFTER = 2 * 60 * 60 * 1000;

const statusDetails = {
	connecting: {
		label: "Connecting",
		message: "Waiting for the selected node’s data.",
	},
	live: {
		label: "Live",
		message: "Updates from one node, not a network-wide measurement.",
	},
	reconnecting: {
		label: "Reconnecting",
		message: "The live connection was interrupted. Waiting for fresh data.",
	},
	error: {
		label: "Unavailable",
		message: "Unable to load node data. Retry the connection.",
	},
	empty: {
		label: "No chain data",
		message: "The source has no accepted block for this network.",
	},
	stale: {
		label: "Stale",
		message:
			"No feed update for at least five minutes. Values may be out of date.",
	},
	oldTip: {
		label: "Stale",
		message:
			"The node’s latest block is at least two hours old. It may be behind; block times also vary.",
	},
};

export function formatBlockAge(timestamp: number | undefined, now: number) {
	if (timestamp === undefined || !Number.isFinite(timestamp))
		return "Unavailable";
	const elapsed = Math.floor((now - timestamp * 1000) / 1000);
	if (elapsed < 0) return "In the future";
	if (elapsed < 60) return "Less than a minute ago";
	if (elapsed < 3600) {
		const minutes = Math.floor(elapsed / 60);
		return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
	}
	if (elapsed < 86400) {
		const hours = Math.floor(elapsed / 3600);
		return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
	}
	const days = Math.floor(elapsed / 86400);
	return `${days} ${days === 1 ? "day" : "days"} ago`;
}

// Each network gets a new, component-scoped feed. Only a subscription result
// can mark it live; a socket reconnect alone cannot validate cached values.
export function useNetworkStatus(now: Ref<number>) {
	const phase = ref<"connecting" | "live" | "reconnecting" | "error">(
		"connecting",
	);
	const tip = shallowRef<MonitorHomeNetworkSubscription["block"][number]>();
	const node = computed(() => tip.value?.accepted_by.at(0)?.node);
	const updatedAt = ref<number>();
	const transactions = computed(() =>
		node.value
			? node.value.unconfirmed_transactions.map(
					({ transaction }) => transaction,
				)
			: [],
	);
	const status = computed(() => {
		const freshness =
			updatedAt.value !== undefined &&
			now.value - updatedAt.value >= FEED_STALE_AFTER
				? "stale"
				: tip.value &&
						now.value - Number(tip.value.timestamp) * 1000 >= BLOCK_STALE_AFTER
					? "oldTip"
					: "live";
		const type =
			phase.value === "live" ? (node.value ? freshness : "empty") : phase.value;
		return { type, ...statusDetails[type] };
	});
	const blockAge = computed(() =>
		formatBlockAge(
			tip.value ? Number(tip.value.timestamp) : undefined,
			now.value,
		),
	);

	function receive(data: MonitorHomeNetworkSubscription) {
		tip.value = data.block.at(0);
		updatedAt.value = now.value;
		phase.value = "live";
	}
	function reconnect() {
		phase.value = "reconnecting";
	}
	function fail() {
		phase.value = "error";
	}

	return {
		node,
		tip,
		transactions,
		status,
		blockAge,
		updatedAt,
		receive,
		reconnect,
		fail,
	};
}
