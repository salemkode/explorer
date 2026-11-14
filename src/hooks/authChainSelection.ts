import type { Ref } from "vue";
import { computed, ref, watch } from "vue";
import type { GetAuthChainsQuery } from "~/graphql/graphql";
import {
	listAuthChains,
	loadAuthChainMetadata,
	selectAuthChain,
} from "~/module/authchains";

export function useAuthChainSelection(
	data: Ref<GetAuthChainsQuery | undefined>,
	category: Ref<string>,
	chainId: Ref<string | undefined>,
	revisionId: Ref<string | undefined>,
) {
	const chains = computed(() =>
		data.value ? listAuthChains(data.value, category.value) : [],
	);
	const selection = computed(() =>
		selectAuthChain(chains.value, chainId.value, revisionId.value),
	);
	const metadata = ref<
		| Awaited<ReturnType<typeof loadAuthChainMetadata>>
		| { status: "loading" }
		| { status: "idle" }
	>({ status: "idle" });
	watch(
		[selection, category],
		async ([selected, tokenCategory], _previous, onCleanup) => {
			const controller = new AbortController();
			onCleanup(() => controller.abort());
			metadata.value = { status: "loading" };
			const result = await loadAuthChainMetadata(
				selected.publicationRevision?.publication || { status: "none" },
				tokenCategory,
				controller.signal,
			);
			// A slow response for the old selection must never replace the new metadata.
			if (!controller.signal.aborted) metadata.value = result;
		},
		{ immediate: true, flush: "sync" },
	);
	return { chains, selection, metadata };
}
