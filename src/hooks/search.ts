import { isValidAddress } from "@/module/bitcoin";
const getQueryUrl = (query: string) => {
	// TODO: make search methods return list of result
	// Removes the leading and trailing white space and line terminator characters from search query.
	const trimQuery = query.trim();
	if (!trimQuery) {
		return;
	}

	const isNumber = !Number.isNaN(+trimQuery);
	if (isNumber) {
		return `/block/${trimQuery}`;
	}
	if (isValidAddress(trimQuery)) {
		return `/address/${trimQuery}`;
	}
	return `/tx/${trimQuery}`;
};

const useSearch = () => {
	const router = useRouter();
	const query = ref("");
	const search = () => {
		const targetUrl = getQueryUrl(query.value);
		if (targetUrl) router.push(targetUrl);
	};

	return {
		query,
		search,
	};
};

export { useSearch };
