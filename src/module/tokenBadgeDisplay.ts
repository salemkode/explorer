import BigNumber from "bignumber.js";

const compactTokenUnits = [
	{ exponent: 12, suffix: "t" },
	{ exponent: 9, suffix: "b" },
	{ exponent: 6, suffix: "m" },
	{ exponent: 3, suffix: "k" },
];

// Display policy only: keep the source integer and exact decimal out of rounding.
export function formatTokenBadgeAmount(raw: string, decimals = 0) {
	if (!/^\d+$/.test(raw)) return;
	// BCMR token decimals are integers from 0 through 18.
	if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) return;

	const amount = new BigNumber(raw).shiftedBy(-decimals);
	const exact = amount.toFixed();
	if (amount.isLessThan(1000)) return { exact, display: exact };

	const rounded = amount.precision(3, BigNumber.ROUND_HALF_UP);
	const approximation = rounded.isEqualTo(amount) ? "" : "≈";
	if (rounded.e !== null && rounded.e >= 15) {
		return { exact, display: `${approximation}${rounded.toExponential()}` };
	}

	const unit = compactTokenUnits.find(({ exponent }) =>
		rounded.isGreaterThanOrEqualTo(`1e${exponent}`),
	);
	if (!unit) return { exact, display: exact };
	return {
		exact,
		display: `${approximation}${rounded.shiftedBy(-unit.exponent).toFixed()}${unit.suffix}`,
	};
}

export function compactTokenBadgeCommitment(commitment: string) {
	if (commitment.length <= 21) return commitment;
	return `${commitment.slice(0, 7)}......${commitment.slice(-8)}`;
}
