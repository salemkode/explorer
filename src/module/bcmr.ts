import BigNumber from "bignumber.js";
import type { GetAuthChainsQuery, GetTxQuery } from "~/graphql/graphql";
import type { IdentitySnapshot, tokenCapability } from "~/types";
import { listAuthChains, selectAuthChain } from "./authchains";
import { exactTokenAmount } from "./tokenBalances";

/** Decode an explicit chain/migration, or a deterministic default for list views. */
export function decodeAuthChain(
	data: GetAuthChainsQuery,
	category: string,
	chainId?: string,
	revisionId?: string,
) {
	const { chain, publicationRevision } = selectAuthChain(
		listAuthChains(data, category),
		chainId,
		revisionId,
	);
	const transaction = chain?.revisions.find(({ transaction }) =>
		transaction.inputs.some(
			({ outpoint_transaction_hash, outpoint_index }) =>
				String(outpoint_index) === "0" &&
				outpoint_transaction_hash.substring(2) === category,
		),
	)?.transaction;
	if (!transaction) return;
	const output = transaction.outputs.find(
		({ token_category }) => token_category?.substring(2) === category,
	);
	if (!output) return;
	const genesisSupply = (() => {
		try {
			return transaction.outputs
				.filter(
					({ token_category }) => token_category?.substring(2) === category,
				)
				.reduce(
					(total, { fungible_token_amount }) =>
						total.plus(exactTokenAmount(fungible_token_amount)),
					new BigNumber("0"),
				)
				.toFixed();
		} catch {
			return undefined;
		}
	})();
	if (genesisSupply === undefined) return;
	return {
		genesesTx: {
			hash: transaction.hash.substring(2),
			genesisSupply,
			lockingBytecode: output?.locking_bytecode.substring(2),
			nftCapability: transaction.outputs.find(
				(output) =>
					output.token_category?.substring(2) === category &&
					output.nonfungible_token_capability,
			)?.nonfungible_token_capability,
		},
		opreturn:
			publicationRevision?.publication.status === "published"
				? publicationRevision.publication.opreturn
				: "",
	};
}

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

/**
 * A transaction hash is a token category only when the spender of its output 0
 * created tokens of that category (CashTokens genesis).
 */
export function isTokenCategoryTransaction(
	transaction:
		| {
				category_genesis?: {
					spent_by: { transaction: { outputs: unknown[] } }[];
				}[];
		  }
		| undefined,
) {
	return !!transaction?.category_genesis?.some((output) =>
		output.spent_by.some((input) => input.transaction.outputs.length > 0),
	);
}
