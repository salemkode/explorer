import { useStorage } from "~/hooks/storage";

// Define main supported theme
const themeState = ["system", "light", "dark"] as const;
export type Theme = (typeof themeState)[number];

export const storedTheme = useStorage<Theme>("theme", "system");

export const prefersTheme = ref<"light" | "dark">("light");

if (typeof window !== "undefined" && window.matchMedia) {
	const deviceTheme = window.matchMedia("(prefers-color-scheme: dark)");
	prefersTheme.value = deviceTheme.matches ? "dark" : "light";
	deviceTheme.addEventListener("change", (event) => {
		prefersTheme.value = event.matches ? "dark" : "light";
	});
}

export const currentTheme = computed<"light" | "dark">(() => {
	if (storedTheme.value === "system") {
		return prefersTheme.value;
	}
	return storedTheme.value;
});

export const isDark = computed(() => currentTheme.value === "dark");

export const applyTheme = (theme: "light" | "dark") => {
	if (typeof document === "undefined") return;
	document.documentElement.setAttribute("data-bs-theme", theme);
	if (theme === "dark") {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}
};

export const toggle = () => {
	const currentIndex = themeState.indexOf(storedTheme.value) + 1;
	const nextIndex = currentIndex === themeState.length ? 0 : currentIndex;
	const nextTheme = themeState[nextIndex];
	storedTheme.value = nextTheme;
};

watchEffect(() => {
	applyTheme(currentTheme.value);
});
