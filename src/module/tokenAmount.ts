/**
 * Exact formatting for on-chain integer amounts (CashToken base units, satoshis).
 *
 * CashToken fungible amounts are unsigned 64-bit integers (up to
 * 9,223,372,036,854,775,807), far beyond Number.MAX_SAFE_INTEGER, so every
 * calculation and every displayed figure goes through bigint.
 */

export type AmountInput = bigint | string | number | null | undefined;

/** Parse an integer amount exactly. Chaingraph returns bigint columns as strings. */
export const toBaseUnits = (value: AmountInput): bigint => {
	if (value === null || value === undefined || value === "") return 0n;
	if (typeof value === "bigint") return value;
	if (typeof value === "number") {
		if (!Number.isSafeInteger(value)) {
			throw new RangeError(`Unsafe integer amount: ${value}`);
		}
		return BigInt(value);
	}
	const trimmed = value.trim();
	if (!/^-?\d+$/.test(trimmed)) {
		throw new RangeError(`Invalid integer amount: ${value}`);
	}
	return BigInt(trimmed);
};

const groupThousands = (digits: string) =>
	digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** BCMR `token.decimals` is an integer 0–18; anything else is treated as 0. */
export const normalizeDecimals = (decimals: unknown): number =>
	typeof decimals === "number" &&
	Number.isInteger(decimals) &&
	decimals >= 0 &&
	decimals <= 18
		? decimals
		: 0;

/**
 * Format base units as a decimal string, e.g. (123456789n, 8) → "1.23456789".
 * Trailing fractional zeros are dropped; nothing is ever rounded.
 */
export const formatTokenAmount = (
	value: AmountInput,
	decimals: unknown = 0,
	{ grouping = true }: { grouping?: boolean } = {},
): string => {
	const amount = toBaseUnits(value);
	const places = normalizeDecimals(decimals);
	const negative = amount < 0n;
	const absolute = negative ? -amount : amount;
	const divisor = 10n ** BigInt(places);
	const whole = (absolute / divisor).toString();
	const fraction =
		places === 0
			? ""
			: (absolute % divisor)
					.toString()
					.padStart(places, "0")
					.replace(/0+$/, "");
	const wholeText = grouping ? groupThousands(whole) : whole;
	return `${negative ? "-" : ""}${wholeText}${fraction ? `.${fraction}` : ""}`;
};

/** Satoshis → BCH, exact (8 decimal places, trailing zeros dropped). */
export const formatSatoshisAsBch = (value: AmountInput): string =>
	formatTokenAmount(value, 8, { grouping: false });
