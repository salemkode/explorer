import { isServer } from "~/module/utils";

const getLocalStorage = () => {
  if (typeof localStorage !== "object") return "not_selected";
  const localStorageIsDark = localStorage.getItem("isDark");

  switch (localStorageIsDark) {
    case "true":
      return "true";
    case "false":
      return "false";
    default:
      return "not_selected";
  }
};

const storeLocalStorage = (isDark: boolean) => {
  if (typeof localStorage !== "object") return;
  localStorage.setItem("isDark", `${isDark}`);
};

const getDeviceTheme = () => {
  const deviceTheme = window.matchMedia("(prefers-color-scheme: dark)");
  switch (deviceTheme.matches) {
    case true:
      return "dark";
    default:
      return "light";
  }
};

const getIsDarkTheme = () => {
  // Check is localStorage has
  const isDarkInStorage = getLocalStorage();
  if (isDarkInStorage === "not_selected") {
    const deviceTheme = getDeviceTheme();
    return deviceTheme === "dark";
  }

  return isDarkInStorage === "true";
};

export const useTheme = () => {
  const isDarkmodeState = ref(getIsDarkTheme());

  const deviceTheme = window.matchMedia("(prefers-color-scheme: dark)");
  deviceTheme.addEventListener("change", () => {
    isDarkmodeState.value = getIsDarkTheme();
  });

  if (!isServer) {
    watchEffect(() => {
      document.documentElement.setAttribute(
        "data-bs-theme",
        isDarkmodeState.value ? "dark" : "light"
      );
    });
  }

  const isDarkmode = computed({
    set: (value) => {
      isDarkmodeState.value = value;
      storeLocalStorage(value);
    },
    get: () => isDarkmodeState.value,
  });

  return {
    isDarkmode,
  };
};
