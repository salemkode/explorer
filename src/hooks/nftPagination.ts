import { computed, ref, watch } from "vue";

// Fetch one extra output to detect the next page without a separate count query.
export function useNftPagination(
	context: () => string,
	viewMode: () => string,
) {
	const offset = ref(0);
	const pageSize = computed(() => (viewMode() === "grid" ? 24 : 8));
	const limit = computed(() => pageSize.value + 1);

	watch(
		[context, viewMode],
		() => {
			offset.value = 0;
		},
		{ flush: "sync" },
	);

	function next(loading: boolean, hasNextPage: boolean) {
		if (!loading && hasNextPage) offset.value += pageSize.value;
	}

	function previous(loading: boolean) {
		if (!loading) offset.value = Math.max(0, offset.value - pageSize.value);
	}

	return { offset, pageSize, limit, next, previous };
}

export function nftPage<T>(outputs: readonly T[], pageSize: number) {
	return {
		items: outputs.slice(0, pageSize),
		hasNextPage: outputs.length > pageSize,
	};
}
