export class TokenBalanceError extends Error {}

/** JSON numbers above the safe integer range have already lost information. */
export function exactTokenAmount(value: unknown) {
	if (value === null || value === undefined) return "0";
	if (typeof value === "string" && /^\d+$/.test(value)) return value;
	if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0)
		return String(value);
	throw new TokenBalanceError("Invalid or unsafe integer scalar.");
}
