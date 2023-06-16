import { binToUtf8, hexToBin } from "@bitauth/libauth";
import { type GetAuthChainsQuery } from "~/graphql/graphql";
import { opreturnToAuthChainElement } from "./bitcoin";

/**
 * Retrieves the genesis transaction and opreturn for a given category from an authchain.
 * @param {GetAuthChainsQuery} authchain - provide authchain from GetAuthChain.
 * @param {string} category - token category to get it for in the authchain object.
 */
export const decodeAuthChain = (
  authchain: GetAuthChainsQuery,
  category: string
) => {
  const genesesTx = {
    hash: undefined as string | undefined,
    genesisSupply: 0,
    lockingBytecode: undefined as string | undefined,
    nftCapability: undefined as
      | "none"
      | "mutable"
      | "minting"
      | null
      | undefined,
  };

  let result = {
    timestamp: "0",
    opreturn: "",
  };

  authchain?.transaction
    .find(({ hash }) => hash.substring(2) === category)
    ?.authchains.at(0)
    ?.migrations.forEach((migration) => {
      const transaction = migration?.transaction?.at(0);

      // Get token genesis information
      const isGenesesTx =
        transaction?.inputs.at(0)?.outpoint_transaction_hash.substring(2) ===
        category;

      if (isGenesesTx) {
        genesesTx.hash = transaction?.hash.substring(2) || "";
        genesesTx.genesisSupply = transaction.outputs.reduce(
          (total: number, { fungible_token_amount }) =>
            fungible_token_amount
              ? total + parseInt(fungible_token_amount)
              : total,
          0
        );
        const output = transaction.outputs?.find(
          (tokenCategory) =>
            tokenCategory.token_category?.substring(2) === category
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
    });

  if (genesesTx.genesisSupply === 0 && !genesesTx.nftCapability) {
    return undefined;
  }

  return {
    genesesTx,
    opreturn: result.opreturn,
  };
};
