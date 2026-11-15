import { describe, expect, mock, spyOn, test } from "bun:test";
import { effectScope, onScopeDispose } from "vue";
import type { MonitorHomeNetworkSubscription } from "../src/graphql/graphql";

// Stub only the Nuxt/Apollo boundary; run the real feed and scope lifecycle.
function harness() {
	const results = new Set<
		(response: { data?: MonitorHomeNetworkSubscription }) => void
	>();
	const errors = new Set<() => void>();
	const socketListeners = {
		closed: new Set<() => void>(),
		error: new Set<() => void>(),
	};
	const stop = mock(() => {});
	const start = mock(() => {});
	const subscribe = mock((..._args: unknown[]) => {
		onScopeDispose(stop);
		return {
			stop,
			start,
			onResult(
				callback: (response: { data?: MonitorHomeNetworkSubscription }) => void,
			) {
				results.add(callback);
				return { off: () => results.delete(callback) };
			},
			onError(callback: () => void) {
				errors.add(callback);
				return { off: () => errors.delete(callback) };
			},
		};
	});
	Object.assign(globalThis, {
		gql: (source: string) => source,
		useSubscription: subscribe,
		useNuxtApp: () => ({
			_apolloWsClients: {
				default: {
					on(event: keyof typeof socketListeners, callback: () => void) {
						socketListeners[event].add(callback);
						return () => socketListeners[event].delete(callback);
					},
				},
			},
		}),
	});
	return { results, errors, socketListeners, subscribe, stop, start };
}

harness();
const { useHomeNetwork } = await import("../src/composables/useHomeNetwork");

describe("shared homepage subscription lifecycle", () => {
	test("one bounded subscription, transport errors, manual retry, and disposal", () => {
		const source = harness();
		const intervals = spyOn(globalThis, "setInterval");
		const timeouts = spyOn(globalThis, "setTimeout");
		const clearIntervals = spyOn(globalThis, "clearInterval");
		const clearTimeouts = spyOn(globalThis, "clearTimeout");
		const scope = effectScope();
		try {
			const feed = scope.run(() => useHomeNetwork("mainnet"));
			expect(source.subscribe).toHaveBeenCalledTimes(1);
			expect(source.subscribe.mock.calls[0]).toEqual([
				expect.anything(),
				{ network: "mainnet", limit: 9, offset: 0 },
				{ fetchPolicy: "no-cache" },
			]);
			expect(feed?.status.value.type).toBe("connecting");
			for (const result of source.results) result({ data: { block: [] } });
			expect(feed?.status.value.type).toBe("empty");
			for (const callback of source.socketListeners.closed) callback();
			expect(feed?.status.value.type).toBe("reconnecting");
			for (const callback of source.errors) callback();
			expect(feed?.status.value.type).toBe("error");
			feed?.retry();
			expect(source.stop).toHaveBeenCalledTimes(1);
			expect(source.start).toHaveBeenCalledTimes(1);
			expect(feed?.status.value.type).toBe("reconnecting");
			for (const result of source.results) result({ data: { block: [] } });
			expect(feed?.status.value.type).toBe("empty");
			scope.stop();
			expect(source.stop).toHaveBeenCalledTimes(2);
			expect(source.results.size).toBe(0);
			expect(source.errors.size).toBe(0);
			expect(source.socketListeners.closed.size).toBe(0);
			expect(source.socketListeners.error.size).toBe(0);
			expect(clearIntervals).toHaveBeenCalledWith(
				intervals.mock.results[0]?.value,
			);
			expect(clearTimeouts).toHaveBeenCalledWith(
				timeouts.mock.results.at(-1)?.value,
			);
		} finally {
			scope.stop();
			intervals.mockRestore();
			timeouts.mockRestore();
			clearIntervals.mockRestore();
			clearTimeouts.mockRestore();
		}
	});

	test("a source that never returns a result times out and can be retried", () => {
		const source = harness();
		const timeouts = spyOn(globalThis, "setTimeout");
		const scope = effectScope();
		try {
			const feed = scope.run(() => useHomeNetwork("mainnet"));
			expect(timeouts.mock.calls[0]?.[1]).toBe(30_000);
			const callback = timeouts.mock.calls[0]?.[0];
			if (typeof callback === "function") callback();
			expect(feed?.status.value.type).toBe("error");
			expect(feed?.node.value).toBeUndefined();
			feed?.retry();
			expect(source.start).toHaveBeenCalledTimes(1);
			expect(feed?.status.value.type).toBe("reconnecting");
			for (const result of source.results) result({ data: { block: [] } });
			expect(feed?.status.value.type).toBe("empty");
		} finally {
			scope.stop();
			timeouts.mockRestore();
		}
	});

	test("switching networks disposes the old listeners and starts without old values", () => {
		const source = harness();
		const mainnet = effectScope();
		mainnet.run(() => useHomeNetwork("mainnet"));
		mainnet.stop();
		const chipnet = effectScope();
		try {
			const feed = chipnet.run(() => useHomeNetwork("chipnet"));
			expect(source.subscribe).toHaveBeenCalledTimes(2);
			expect(source.results.size).toBe(1);
			expect(source.socketListeners.closed.size).toBe(1);
			expect(feed?.node.value).toBeUndefined();
			expect(feed?.tip.value).toBeUndefined();
			expect(feed?.status.value.type).toBe("connecting");
		} finally {
			chipnet.stop();
		}
	});
});
