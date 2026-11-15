import { type Ref, ref, shallowRef, watch } from "vue";
import type { loadTokenBalances } from "../module/tokenBalances";

/** Discard in-flight results immediately when the address, category or network changes. */
export function useTokenBalanceSnapshot(
	scope: Readonly<Ref<Parameters<typeof loadTokenBalances>[0] | null>>,
	load: (
		current: Parameters<typeof loadTokenBalances>[0],
		signal: AbortSignal,
	) => ReturnType<typeof loadTokenBalances>,
) {
	const state = shallowRef<
		| Awaited<ReturnType<typeof loadTokenBalances>>
		| { status: "unavailable" }
		| { status: "loading" }
		| { status: "error"; message: string }
	>({ status: "loading" });
	const revision = ref(0);
	watch(
		[scope, revision],
		async ([current], _, onCleanup) => {
			if (!current) {
				state.value = { status: "unavailable" };
				return;
			}
			const controller = new AbortController();
			onCleanup(() => controller.abort());
			state.value = { status: "loading" };
			try {
				const result = await load(current, controller.signal);
				if (!controller.signal.aborted) state.value = result;
			} catch {
				if (!controller.signal.aborted) {
					state.value = {
						status: "error",
						message:
							"Complete confirmed balances could not be loaded. Refresh to try again.",
					};
				}
			}
		},
		{ immediate: true, flush: "sync" },
	);
	return { state, refresh: () => revision.value++ };
}
