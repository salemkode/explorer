const getStoredState = <T>(key: string, defaults: T): T => {
	if (typeof window !== "undefined" && window.localStorage) {
		try {
			const storedState = localStorage.getItem(key);
			if (storedState !== null) {
				try {
					return JSON.parse(storedState) as T;
				} catch {
					// Fallback in case raw strings or invalid JSON were saved previously
					return storedState as unknown as T;
				}
			}
		} catch (e) {
			console.error("Failed to read from localStorage:", e);
		}
	}

	return defaults;
};

export const useStorage = <T>(key: string, defaults: T) => {
	const state = ref<T>(getStoredState<T>(key, defaults));

	watch(
		state,
		(value) => {
			if (typeof window !== "undefined" && window.localStorage) {
				try {
					localStorage.setItem(key, JSON.stringify(value));
				} catch (e) {
					console.error("Failed to write to localStorage:", e);
				}
			}
		},
		{
			deep: true,
		},
	);

	return state;
};
