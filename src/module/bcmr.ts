import type { GetAuthChainsQuery } from "~/graphql/graphql";
import type { Capability, IdentitySnapshot, tokenCapability } from "~/types";
import { opreturnToAuthChainElement } from "./bitcoin";
import { summarizeGenesis } from "./tokenStats";

/**
 * Retrieves the genesis transaction and opreturn for a given category from an authchain.
 * @param {GetAuthChainsQuery} authchain - provide authchain from GetAuthChain.
 * @param {string} category - token category to get it for in the authchain object.
 */
export const decodeAuthChain = (
	authchain: GetAuthChainsQuery,
	category: string,
) => {
	const genesesTx = {
		hash: undefined as string | undefined,
		/** exact FT supply minted to this category at genesis */
		genesisSupply: 0n,
		hasGenesisNFTs: false,
		lockingBytecode: undefined as string | undefined,
		nftCapability: undefined as Capability | null | undefined,
	};

	let result = {
		timestamp: "0",
		opreturn: "",
	};

	const migrations =
		authchain?.transaction
			.find(({ hash }) => hash.substring(2) === category)
			?.authchains.at(0)?.migrations || [];

	for (const migration of migrations) {
		const transaction = migration?.transaction?.at(0);

		// Get token genesis information
		const isGenesesTx =
			transaction?.inputs.at(0)?.outpoint_transaction_hash.substring(2) ===
			category;

		if (isGenesesTx) {
			genesesTx.hash = transaction?.hash.substring(2) || "";
			const genesis = summarizeGenesis(transaction.outputs, category);
			genesesTx.genesisSupply = genesis.genesisSupplyFT;
			genesesTx.hasGenesisNFTs = genesis.hasGenesisNFTs;
			const output = transaction.outputs?.find(
				(tokenCategory) =>
					tokenCategory.token_category?.substring(2) === category,
			);
			genesesTx.nftCapability = output?.nonfungible_token_capability;
			genesesTx.lockingBytecode = output?.locking_bytecode.substring(2);
		}

		// Get the opreturn from the first output
		const opreturn = transaction?.outputs
			?.find((vout) => vout.locking_bytecode.startsWith("\\x6a"))
			?.locking_bytecode.substring(2);
		const timestamp = transaction?.block_inclusions.at(0)?.block.timestamp;
		const registryElement = opreturn && opreturnToAuthChainElement(opreturn);
		if (
			timestamp &&
			registryElement &&
			typeof registryElement !== "string" &&
			+result.timestamp < +timestamp
		) {
			result = {
				timestamp: timestamp,
				opreturn,
			};
		}
	}

	if (genesesTx.genesisSupply === 0n && !genesesTx.hasGenesisNFTs) {
		return undefined;
	}

	return {
		genesesTx,
		opreturn: result.opreturn,
	};
};

export const getChildToken = (
	identitySnapshot: IdentitySnapshot,
	capability?: tokenCapability,
	nftCommitment?: string,
) => {
	if (capability && capability !== "minting" && nftCommitment) {
		const metadata = identitySnapshot.token?.nfts?.parse.types?.[nftCommitment];

		if (metadata) {
			return metadata;
		}
	}
};
