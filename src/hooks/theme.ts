import { isServer } from "~/module/utils";
import { useStorage } from "~/hooks/storage";

// Define main supported theme
const themeState = ["system", "light", "dark"] as const;
export type Theme = (typeof themeState)[number];

const applyTheme = (theme: "light" | "dark") => {
  if (isServer) return;
  document.documentElement.setAttribute("data-bs-theme", theme);
};

export const storedTheme = useStorage<Theme>("theme", "system");

export const toggle = () => {
  const currentIndex = themeState.indexOf(storedTheme.value) + 1;
  const nextIndex = currentIndex === themeState.length ? 0 : currentIndex;
  const nextTheme = themeState[nextIndex];
  storedTheme.value = nextTheme;
};

export const deviceTheme = window.matchMedia("(prefers-color-scheme: dark)");
export const prefersTheme = ref<"light" | "dark">(
  deviceTheme.matches ? "dark" : "light"
);
deviceTheme.addEventListener("change", (event) => {
  prefersTheme.value = event.matches ? "dark" : "light";
});

watchEffect(() => {
  if (isServer) return;

  if (storedTheme.value === "system") {
    applyTheme(prefersTheme.value);
  } else {
    applyTheme(storedTheme.value);
  }
});
