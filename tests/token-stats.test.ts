import { describe, expect, test } from "bun:test";
import {
	TOKENBURNER_LOCKING_BYTECODE,
	type TokenOutputRow,
	aggregateBurns,
	computeHolderStats,
	computeSupplyFigures,
	getTokenType,
	isProvableBurn,
	summarizeGenesis,
} from "../src/module/tokenStats";

const P2PKH_A = "\\x76a914aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa88ac";
const P2PKH_B = "\\x76a914bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb88ac";
const P2SH = "\\xa914cccccccccccccccccccccccccccccccccccccccc87";
const IDENTITY = "\\xa914dddddddddddddddddddddddddddddddddddddddd87";
const tx = (n: number) => `\\x${n.toString(16).padStart(64, "0")}`;

const row = (
	n: number,
	locking: string,
	amount: string | null,
	capability: TokenOutputRow["nonfungible_token_capability"] = null,
	index = 0,
): TokenOutputRow => ({
	transaction_hash: tx(n),
	output_index: String(index),
	locking_bytecode: locking,
	fungible_token_amount: amount,
	nonfungible_token_capability: capability,
});

describe("burn detection", () => {
	test("matches tokenexplorer.cash's burner contract address", () => {
		expect(TOKENBURNER_LOCKING_BYTECODE).toMatch(/^aa20[0-9a-f]{64}87$/);
		expect(isProvableBurn(`\\x${TOKENBURNER_LOCKING_BYTECODE}`)).toBe(true);
	});
	test("OP_RETURN outputs are burns, ordinary outputs are not", () => {
		expect(isProvableBurn("\\x6a0442434d52")).toBe(true);
		expect(isProvableBurn(P2PKH_A)).toBe(false);
	});
});

describe("summarizeGenesis", () => {
	test("only counts the requested category and detects later NFT outputs", () => {
		const category = "ab".repeat(32);
		const result = summarizeGenesis(
			[
				{
					token_category: `\\x${category}`,
					fungible_token_amount: "9223372036854775807",
				},
				{
					token_category: `\\x${"cd".repeat(32)}`,
					fungible_token_amount: "500",
				},
				{
					token_category: `\\x${category}`,
					fungible_token_amount: "0",
					nonfungible_token_capability: "mutable",
				},
			],
			category,
		);
		expect(result.genesisSupplyFT).toBe(9223372036854775807n);
		expect(result.hasGenesisNFTs).toBe(true);
		expect(getTokenType(result.genesisSupplyFT, result.hasGenesisNFTs)).toBe(
			"Fungible + Non-Fungible",
		);
	});
});

describe("computeHolderStats", () => {
	// Mirrors BLAZE EMBER (2026): max supply minted, the rest reserved on the
	// identity output that also carries a mutable NFT.
	const rows = [
		row(1, IDENTITY, "9223372036854773807", "mutable"),
		row(2, P2PKH_A, "1500"),
		row(3, P2PKH_A, "200"),
		row(4, P2PKH_B, "269"),
		row(5, P2SH, "31"),
		row(6, "\\x6a", "7"), // bare OP_RETURN, excluded
		row(2, P2PKH_A, "1500"), // duplicate page row, deduplicated
	];
	const identity = {
		authheadHash: tx(1),
		output_index: 0,
		locking_bytecode: IDENTITY,
		fungible_token_amount: "9223372036854773807",
		nonfungible_token_capability: "mutable" as const,
	};
	const stats = computeHolderStats(rows, identity);

	test("reserve counts the identity output once", () => {
		expect(stats.reservedFT).toBe(9223372036854773807n);
		expect(stats.hasActiveMinting).toBe(false);
	});
	test("holder counts and user/contract split exclude reserves", () => {
		expect(stats.userAddresses).toBe(2);
		expect(stats.contractAddresses).toBe(2);
		expect(stats.totalAddresses).toBe(4);
		expect(stats.userFT).toBe(1969n);
		expect(stats.contractFT).toBe(31n);
		expect(stats.totalNFTs).toBe(1);
	});
	test("holder balances aggregate per address, largest first", () => {
		expect(
			stats.holders.map((h) => [
				h.lockingBytecode.slice(0, 6),
				h.fungibleAmount,
			]),
		).toEqual([
			["a914dd", 9223372036854773807n],
			["76a914", 1700n],
			["76a914", 269n],
			["a914cc", 31n],
		]);
	});
	test("supply figures match tokenexplorer.cash", () => {
		const figures = computeSupplyFigures(9223372036854775807n, stats, {
			burnedFT: 0n,
			burnedNFTs: 0,
			burnOutputs: 0,
			burnTransactions: 0,
		});
		expect(figures.circulatingFT).toBe(2000n);
		expect(figures.circulatingExclBurnsFT).toBe(2000n);
		expect(figures.removedFT).toBe(0n);
		expect(figures.inconsistent).toBe(false);
	});
	test("authhead FT is added when it is not a minting/mutable output", () => {
		const plain = computeHolderStats(
			[row(7, IDENTITY, "1000"), row(8, P2PKH_A, "5", "minting")],
			{
				...identity,
				authheadHash: tx(7),
				fungible_token_amount: "1000",
				nonfungible_token_capability: null,
			},
		);
		expect(plain.reservedFT).toBe(1005n);
		expect(plain.hasActiveMinting).toBe(true);
		expect(plain.userFT).toBe(0n);
	});
	test("a burned identity output is not reserve", () => {
		const burned = computeHolderStats([], {
			...identity,
			locking_bytecode: "\\x6a",
		});
		expect(burned.reservedFT).toBe(0n);
	});
});

describe("burns", () => {
	const burnRow = (
		n: number,
		amount: string,
		valid: boolean,
		capability: "none" | null = null,
	) => ({
		transaction_hash: tx(n),
		output_index: "1",
		fungible_token_amount: amount,
		nonfungible_token_capability: capability,
		transaction: valid
			? { node_validations: [], block_inclusions: [{}] }
			: { node_validations: [], block_inclusions: [] },
	});
	test("dropped transactions are ignored and outpoints deduplicated", () => {
		const burns = aggregateBurns([
			burnRow(1, "100", true),
			burnRow(1, "100", true),
			burnRow(2, "50", false),
			burnRow(3, "0", true, "none"),
		]);
		expect(burns.burnedFT).toBe(100n);
		expect(burns.burnedNFTs).toBe(1);
		expect(burns.burnTransactions).toBe(2);
	});
	test("removed supply splits into burned and not passed on", () => {
		const figures = computeSupplyFigures(
			1000n,
			{ reservedFT: 100n, totalUnspentFT: 700n },
			{ burnedFT: 120n, burnedNFTs: 0, burnOutputs: 1, burnTransactions: 1 },
		);
		expect(figures.circulatingFT).toBe(900n);
		expect(figures.circulatingExclBurnsFT).toBe(600n);
		expect(figures.removedFT).toBe(300n);
		expect(figures.burnedFT).toBe(120n);
		expect(figures.removedWithoutBurnOutputFT).toBe(180n);
	});
	test("stale data is flagged instead of shown as negative", () => {
		const figures = computeSupplyFigures(1000n, {
			reservedFT: 0n,
			totalUnspentFT: 1200n,
		});
		expect(figures.inconsistent).toBe(true);
	});
});
