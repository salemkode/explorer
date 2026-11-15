import type { GetAuthChainsQuery, GetTxQuery } from "~/graphql/graphql";
import type { Capability, IdentitySnapshot, tokenCapability } from "~/types";
import { opreturnToAuthChainElement } from "./bitcoin";

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
		genesisSupply: 0,
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
		const isGenesesTx = transaction?.inputs.some(
			(input) =>
				String(input.outpoint_index) === "0" &&
				input.outpoint_transaction_hash.substring(2) === category,
		);

		if (
			transaction &&
			isGenesesTx &&
			transaction.outputs.some(
				(output) => output.token_category?.substring(2) === category,
			)
		) {
			genesesTx.hash = transaction?.hash.substring(2) || "";
			genesesTx.genesisSupply = transaction.outputs.reduce(
				(total: number, { fungible_token_amount }) =>
					fungible_token_amount
						? total + Number.parseInt(fungible_token_amount, 10)
						: total,
				0,
			);
			const output = transaction.outputs?.find(
				(tokenCategory) =>
					tokenCategory.token_category?.substring(2) === category,
			);
			genesesTx.nftCapability = transaction.outputs.find(
				(output) =>
					output.token_category?.substring(2) === category &&
					output.nonfungible_token_capability,
			)?.nonfungible_token_capability;
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

	if (genesesTx.genesisSupply === 0 && !genesesTx.nftCapability) {
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

/** Never present a descendant's latest metadata as a publication of this transaction. */
export function getTransactionTokenPublication(
	transaction: GetTxQuery["transaction"][number] | undefined,
	authchain: GetAuthChainsQuery | undefined,
	category: string,
) {
	if (!transaction || transaction.hash.substring(2) !== category || !authchain)
		return;
	const chain = decodeAuthChain(authchain, category);
	if (!chain?.opreturn) return;
	const publication = transaction.outputs.find(
		(output) => output.locking_bytecode === `\\x${chain.opreturn}`,
	);
	if (publication) return { category, opreturn: chain.opreturn };
}
