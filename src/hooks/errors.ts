// Replacement for Nuxt's showError(): navigates to the not-found page and
// carries the error payload through history state so the page can render it.
export const useHttpError = () => {
	const router = useRouter();

	return (payload: { statusCode: number; message: string }) => {
		router.replace({
			name: "not-found",
			state: { httpError: payload },
		});
	};
};
