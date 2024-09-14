import { isServer } from "~/module/utils";

const getStoredState = <T>(key: string, defaults: T) => {
	if (!isServer) {
		// Check is localStorage has stored value
		const storedState = localStorage.getItem(key);
		if (storedState) return JSON.parse(storedState) as T;
	}

	return defaults;
};

export const useStorage = <T>(key: string, defaults: T) => {
	const state = ref(getStoredState(key, defaults));

	watch(state, (value) => {
		if (!isServer) localStorage.setItem(key, JSON.stringify(value));
	});

	return state;
};
