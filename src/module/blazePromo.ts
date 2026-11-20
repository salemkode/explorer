export type BlazePromoConfig = {
	/** Feature flag. When false the banner never renders. */
	enabled: boolean;
	/** Campaign id. Changing it shows the banner again to users who dismissed an earlier one. */
	id: string;
	/** Destination of the call to action. */
	url: string;
	/** ISO timestamp after which the banner hides itself. Empty means no expiry; an invalid value hides it. */
	until: string;
	/** True when `url` is overridden to the project's BLAZE (DoraHacks) page instead of the app itself. */
	projectPage: boolean;
};

export const BLAZE_PROMO_STORAGE_KEY = "blaze-promo-dismissed";

const FALSE_VALUES = new Set(["0", "false", "no", "n", "off", "disabled"]);
const TRUE_VALUES = new Set(["1", "true", "yes", "y", "on", "enabled"]);

/** Reads an env-style flag. Missing or unknown values fall back to `fallback`. */
export const parseFlag = (value: unknown, fallback: boolean): boolean => {
	if (typeof value === "boolean") return value;
	if (typeof value !== "string" || value.trim() === "") return fallback;
	const normalized = value.trim().toLowerCase();
	if (FALSE_VALUES.has(normalized)) return false;
	if (TRUE_VALUES.has(normalized)) return true;
	return fallback;
};

const isSafeUrl = (url: string) => {
	try {
		const { protocol } = new URL(url);
		return protocol === "https:" || protocol === "http:";
	} catch {
		return false;
	}
};

/** The value stored in localStorage when this campaign is dismissed. */
export const blazePromoDismissKey = (config: Partial<BlazePromoConfig>) =>
	config.id || "dismissed";

export const shouldShowBlazePromo = (
	config: Partial<BlazePromoConfig> | undefined,
	dismissedId: string | null,
	now: Date = new Date(),
): boolean => {
	if (!config || parseFlag(config.enabled, false) !== true) return false;
	if (!config.url || !isSafeUrl(config.url)) return false;
	if (dismissedId === blazePromoDismissKey(config)) return false;
	if (config.until) {
		const until = Date.parse(config.until);
		// Fail closed: a mistyped expiry must not keep the ad up forever.
		if (Number.isNaN(until) || now.getTime() >= until) return false;
	}
	return true;
};
