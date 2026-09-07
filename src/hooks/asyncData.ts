// Minimal replacement for Nuxt's useAsyncData(): resolves the handler on
// the client and exposes the result as a ref.
export const useAsyncData = <T>(handler: () => Promise<T>) => {
	const data = ref<T>();

	handler().then((value) => {
		data.value = value;
	});

	return { data };
};
