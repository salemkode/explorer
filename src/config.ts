// Build-time feature flags (previously runtimeConfig.public in Nuxt)
export const features = {
	converterAlpha: import.meta.env.VITE_FEATURE_CONVERTER_ALPHA !== "false",
};
