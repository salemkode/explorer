import { binToHex, hash256, hexToBin } from "@bitauth/libauth";
import { toBaseUnits } from "./tokenAmount";

/**
 * Token supply and holder statistics, using the same definitions as
 * tokenexplorer.cash so both explorers report identical figures:
 *
 * - genesis supply: FT minted to the category in the genesis transaction
 * - reserved supply: FT on unspent minting/mutable NFT outputs plus FT on the
 *   authhead identity output
 * - circulating supply: genesis − reserved
 * - circulating (excl. burns): all unspent FT − reserved
 * - removed from supply: genesis − all unspent FT, split into tokens sent to a
 *   provable burn output and tokens not passed on to any output
 *
 * All amounts are bigint; Chaingraph returns them as decimal strings.
 */

type Capability = "none" | "mutable" | "minting";

export interface TokenOutputRow {
	transaction_hash: string;
	output_index: string | number;
	locking_bytecode: string;
	fungible_token_amount?: string | null;
	nonfungible_token_capability?: Capability | null;
	nonfungible_token_commitment?: string | null;
}

export interface BurnOutputRow {
	transaction_hash: string;
	output_index: string | number;
	locking_bytecode?: string;
	fungible_token_amount?: string | null;
	nonfungible_token_capability?: Capability | null;
	transaction?: {
		node_validations: unknown[];
		block_inclusions: unknown[];
	} | null;
}

export interface IdentityOutput {
	authheadHash: string;
	output_index: string | number;
	locking_bytecode: string;
	fungible_token_amount?: string | null;
	nonfungible_token_capability?: Capability | null;
}

/** Strip Chaingraph's `\x` bytea prefix and lowercase. */
export const hexOf = (bytea: string) =>
	(bytea.startsWith("\\x") ? bytea.slice(2) : bytea).toLowerCase();

const outpointOf = (row: {
	transaction_hash: string;
	output_index: string | number;
}) => `${hexOf(row.transaction_hash)}:${Number(row.output_index)}`;

// tokenburner.cash burner contract: anyone can spend it, but only into a single
// token-less OP_RETURN output, so tokens sent there are destroyed. Redeem script:
// OP_TXOUTPUTCOUNT OP_1 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0
// OP_EQUALVERIFY <0x6a> OP_0 OP_OUTPUTBYTECODE OP_1 OP_SPLIT OP_DROP OP_EQUAL
export const TOKENBURNER_REDEEM_SCRIPT = "c4519d00d10088016a00cd517f7587";
/** P2SH32 locking bytecode of the burner: OP_HASH256 <hash256(script)> OP_EQUAL */
export const TOKENBURNER_LOCKING_BYTECODE = `aa20${binToHex(
	hash256(hexToBin(TOKENBURNER_REDEEM_SCRIPT)),
)}87`;

/** OP_RETURN outputs and the burner contract can never move tokens again. */
export const isProvableBurn = (lockingBytecode: string) => {
	const hex = hexOf(lockingBytecode);
	return hex.startsWith("6a") || hex === TOKENBURNER_LOCKING_BYTECODE;
};

/** P2PKH locking bytecode (OP_DUP OP_HASH160 <20 bytes> …) = a user wallet. */
export const isUserLockingBytecode = (lockingBytecode: string) =>
	hexOf(lockingBytecode).startsWith("76a914");

/** Genesis FT supply and whether NFTs were minted, for one category. */
export const summarizeGenesis = (
	outputs: {
		token_category?: string | null;
		fungible_token_amount?: string | null;
		nonfungible_token_capability?: Capability | null;
	}[],
	category: string,
) => {
	const wanted = hexOf(category);
	let genesisSupplyFT = 0n;
	let hasGenesisNFTs = false;
	for (const output of outputs) {
		if (!output.token_category || hexOf(output.token_category) !== wanted)
			continue;
		genesisSupplyFT += toBaseUnits(output.fungible_token_amount);
		if (output.nonfungible_token_capability) hasGenesisNFTs = true;
	}
	return { genesisSupplyFT, hasGenesisNFTs };
};

export const getTokenType = (
	genesisSupplyFT: bigint,
	hasGenesisNFTs: boolean,
) => {
	if (genesisSupplyFT > 0n && hasGenesisNFTs) return "Fungible + Non-Fungible";
	if (genesisSupplyFT > 0n) return "Fungible Token";
	if (hasGenesisNFTs) return "NFT Collection";
	return "CashToken";
};

export interface HolderBalance {
	lockingBytecode: string;
	fungibleAmount: bigint;
	nftCount: number;
}

export interface ReserveStats {
	reservedFT: bigint;
	reservedOutpoints: Set<string>;
	hasActiveMinting: boolean;
	/** minting/mutable outputs plus the authhead identity output (if it holds FT) */
	reserveOutputs: number;
}

export interface TokenHolderStats extends ReserveStats {
	/** unspent outputs that still hold tokens (provable burns removed) */
	outputCount: number;
	totalUnspentFT: bigint;
	totalNFTs: number;
	userAddresses: number;
	contractAddresses: number;
	totalAddresses: number;
	userFT: bigint;
	contractFT: bigint;
	/** sorted by FT desc, then NFT count desc */
	holders: HolderBalance[];
}

/**
 * Reserved supply: FT on unspent minting/mutable NFT outputs, plus FT on the
 * authhead identity output when that is not already one of them. Outputs on a
 * provable burn are destroyed, not reserved. `rows` may be the complete
 * unspent set or just the unspent minting/mutable outputs.
 */
export const computeReserve = (
	rows: TokenOutputRow[],
	identity?: IdentityOutput | null,
): ReserveStats => {
	let reservedFT = 0n;
	const reservedOutpoints = new Set<string>();
	let hasActiveMinting = false;
	for (const row of rows) {
		const capability = row.nonfungible_token_capability;
		if (capability !== "minting" && capability !== "mutable") continue;
		if (isProvableBurn(row.locking_bytecode)) continue;
		const outpoint = outpointOf(row);
		if (reservedOutpoints.has(outpoint)) continue;
		if (capability === "minting") hasActiveMinting = true;
		reservedOutpoints.add(outpoint);
		reservedFT += toBaseUnits(row.fungible_token_amount);
	}
	if (identity && !isProvableBurn(identity.locking_bytecode)) {
		const outpoint = `${hexOf(identity.authheadHash)}:${Number(identity.output_index)}`;
		const identityFT = toBaseUnits(identity.fungible_token_amount);
		if (!reservedOutpoints.has(outpoint) && identityFT > 0n) {
			reservedOutpoints.add(outpoint);
			reservedFT += identityFT;
		}
	}
	return {
		reservedFT,
		reservedOutpoints,
		hasActiveMinting,
		reserveOutputs: reservedOutpoints.size,
	};
};

/**
 * Holder and reserve figures from the complete set of unspent token outputs.
 * `identity` is the authhead identity output (output 0 of the authhead).
 */
export const computeHolderStats = (
	unspentRows: TokenOutputRow[],
	identity?: IdentityOutput | null,
): TokenHolderStats => {
	const byOutpoint = new Map<string, TokenOutputRow>();
	for (const row of unspentRows) {
		if (isProvableBurn(row.locking_bytecode)) continue;
		byOutpoint.set(outpointOf(row), row);
	}
	const outputs = [...byOutpoint.values()];
	const reserve = computeReserve(outputs, identity);
	const { reservedOutpoints } = reserve;

	let totalUnspentFT = 0n;
	let totalNFTs = 0;
	let userFT = 0n;
	let contractFT = 0n;
	const balances = new Map<string, HolderBalance>();
	for (const [outpoint, row] of byOutpoint) {
		const locking = hexOf(row.locking_bytecode);
		const amount = toBaseUnits(row.fungible_token_amount);
		const isNft = !!row.nonfungible_token_capability;
		totalUnspentFT += amount;
		if (isNft) totalNFTs++;
		if (!reservedOutpoints.has(outpoint)) {
			if (isUserLockingBytecode(locking)) userFT += amount;
			else contractFT += amount;
		}
		const balance = balances.get(locking) ?? {
			lockingBytecode: locking,
			fungibleAmount: 0n,
			nftCount: 0,
		};
		balance.fungibleAmount += amount;
		if (isNft) balance.nftCount++;
		balances.set(locking, balance);
	}

	const holders = [...balances.values()].sort((a, b) =>
		a.fungibleAmount === b.fungibleAmount
			? b.nftCount - a.nftCount ||
				a.lockingBytecode.localeCompare(b.lockingBytecode)
			: a.fungibleAmount > b.fungibleAmount
				? -1
				: 1,
	);
	const userAddresses = holders.filter((holder) =>
		isUserLockingBytecode(holder.lockingBytecode),
	).length;

	return {
		...reserve,
		outputCount: outputs.length,
		totalUnspentFT,
		totalNFTs,
		userAddresses,
		contractAddresses: holders.length - userAddresses,
		totalAddresses: holders.length,
		userFT,
		contractFT,
		holders,
	};
};

export interface KnownBurns {
	burnedFT: bigint;
	burnedNFTs: number;
	burnOutputs: number;
	burnTransactions: number;
}

/**
 * Sum provable burns. Chaingraph keeps transactions it once saw in a mempool
 * even after they were dropped, so a row only counts while its transaction is
 * in a mempool or a block.
 */
export const aggregateBurns = (rows: BurnOutputRow[]): KnownBurns => {
	const byOutpoint = new Map<string, BurnOutputRow>();
	for (const row of rows) {
		const tx = row.transaction;
		if (
			!tx ||
			(tx.node_validations.length === 0 && tx.block_inclusions.length === 0)
		)
			continue;
		byOutpoint.set(outpointOf(row), row);
	}
	let burnedFT = 0n;
	let burnedNFTs = 0;
	const transactions = new Set<string>();
	for (const row of byOutpoint.values()) {
		burnedFT += toBaseUnits(row.fungible_token_amount);
		if (row.nonfungible_token_capability) burnedNFTs++;
		transactions.add(hexOf(row.transaction_hash));
	}
	return {
		burnedFT,
		burnedNFTs,
		burnOutputs: byOutpoint.size,
		burnTransactions: transactions.size,
	};
};

export interface SupplyFigures {
	genesisSupplyFT: bigint;
	reservedFT: bigint;
	circulatingFT: bigint;
	circulatingExclBurnsFT: bigint;
	/** genesis − all unspent FT; negative only when Chaingraph data is inconsistent */
	removedFT: bigint;
	/** FT sent to a provable burn output (undefined when burns are unknown) */
	burnedFT?: bigint;
	/** FT spent without being passed on to any output */
	removedWithoutBurnOutputFT?: bigint;
	inconsistent: boolean;
}

export const computeSupplyFigures = (
	genesisSupplyFT: bigint,
	holders: Pick<TokenHolderStats, "reservedFT" | "totalUnspentFT">,
	burns?: KnownBurns,
): SupplyFigures => {
	const removedFT = genesisSupplyFT - holders.totalUnspentFT;
	const burnedFT = burns?.burnedFT;
	const removedWithoutBurnOutputFT =
		burnedFT === undefined ? undefined : removedFT - burnedFT;
	return {
		genesisSupplyFT,
		reservedFT: holders.reservedFT,
		circulatingFT: genesisSupplyFT - holders.reservedFT,
		circulatingExclBurnsFT: holders.totalUnspentFT - holders.reservedFT,
		removedFT,
		burnedFT,
		removedWithoutBurnOutputFT,
		inconsistent:
			removedFT < 0n ||
			(removedWithoutBurnOutputFT !== undefined &&
				removedWithoutBurnOutputFT < 0n),
	};
};
