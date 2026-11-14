import { binToHex, hexToBin, sha256 } from "@bitauth/libauth";
import type { GetAuthChainsQuery } from "~/graphql/graphql";
import type { Registry } from "~/types";
import { opreturnToAuthChainElement, parseBinary } from "./bitcoin";
import { validateBcmrSchema } from "./utils";

function getPublication(
	outputs: NonNullable<
		GetAuthChainsQuery["transaction"][number]["authchains"][number]["migrations"][number]["transaction"]
	>[number]["outputs"],
) {
	const opreturn = outputs
		.map((output) => output.locking_bytecode.substring(2))
		.find((script) => /^6a(?:04|4c04|4d0400|4e04000000)42434d52/.test(script));
	if (!opreturn) return { status: "none" as const };
	const publication = opreturnToAuthChainElement(opreturn);
	if (typeof publication === "string") {
		return { status: "invalid" as const, opreturn };
	}
	return {
		status: "published" as const,
		opreturn,
		...publication,
		checkHash: parseBinary(hexToBin(opreturn)).length >= 3,
	};
}

export function listAuthChains(data: GetAuthChainsQuery, category: string) {
	const transaction = data.transaction.find(
		({ hash }) => hash.substring(2) === category,
	);
	return (transaction?.authchains || [])
		.flatMap((chain) => {
			const id = (
				chain.authhead_transaction_hash || chain.authhead?.hash
			)?.substring(2);
			if (!id) return [];
			const revisions = chain.migrations
				.flatMap((migration) =>
					(migration.transaction || []).map((tx) => ({
						id: tx.hash.substring(2),
						index: migration.migration_index,
						timestamp: tx.block_inclusions
							.map(({ block }) => block.timestamp)
							.sort((a, b) => Number(b) - Number(a))
							.at(0),
						publication: getPublication(tx.outputs),
						transaction: tx,
					})),
				)
				.sort((a, b) => {
					// Migration order, rather than block time, also orders updates in one block.
					const first = BigInt(a.index || "0");
					const second = BigInt(b.index || "0");
					return first === second
						? a.id.localeCompare(b.id)
						: first > second
							? -1
							: 1;
				});
			return [
				{
					id,
					length: chain.authchain_length,
					unspent: chain.unspent_authhead,
					reservedSupply:
						chain.authhead?.identity_output?.at(0)?.fungible_token_amount,
					revisions,
				},
			];
		})
		.sort(
			(a, b) =>
				Number(b.unspent) - Number(a.unspent) || a.id.localeCompare(b.id),
		);
}

export function selectAuthChain(
	chains: ReturnType<typeof listAuthChains>,
	chainId?: string,
	revisionId?: string,
) {
	const chain = chainId
		? chains.find(({ id }) => id === chainId)
		: chains.at(0);
	const revision = revisionId
		? chain?.revisions.find(({ id }) => id === revisionId)
		: chain?.revisions.at(0);
	const position = chain?.revisions.findIndex(({ id }) => id === revision?.id);
	// Migrations without a publication retain the preceding publication on this chain only.
	const publicationRevision =
		position !== undefined && position >= 0
			? chain?.revisions
					.slice(position)
					.find(({ publication }) => publication.status !== "none")
			: undefined;
	return {
		chain,
		revision,
		publicationRevision,
		missing: Boolean((chainId && !chain) || (revisionId && !revision)),
	};
}

export function getRegistryIdentity(registry: Registry, category: string) {
	const history = registry.identities?.[category];
	if (!history) return;
	const revision = Object.keys(history)
		.filter((timestamp) => Date.parse(timestamp) <= Date.now())
		.sort((a, b) => Date.parse(b) - Date.parse(a) || a.localeCompare(b))
		.at(0);
	const identity = revision ? history[revision] : undefined;
	return identity?.token?.category === category ? identity : undefined;
}

export async function loadAuthChainMetadata(
	publication: ReturnType<typeof getPublication>,
	category: string,
	signal?: AbortSignal,
) {
	if (publication.status !== "published") {
		return {
			status: "unavailable" as const,
			message:
				publication.status === "invalid"
					? "This migration has a malformed BCMR publication."
					: "No metadata has been published at this migration.",
		};
	}
	try {
		const response = await fetch(publication.url, { signal });
		if (!response.ok)
			return {
				status: "unavailable" as const,
				message: `Metadata could not be loaded (HTTP ${response.status}).`,
			};
		const bytes = new Uint8Array(await response.arrayBuffer());
		const actualHash = binToHex(sha256.hash(bytes));
		const hashStatus = publication.checkHash
			? actualHash === publication.contentHash
				? ("match" as const)
				: ("mismatch" as const)
			: ("not-checked" as const);
		if (hashStatus === "mismatch")
			return {
				status: "unavailable" as const,
				hashStatus,
				actualHash,
				message:
					"Metadata hash mismatch. This content does not match the publication and is not displayed.",
			};
		const registry = await validateBcmrSchema(
			JSON.parse(new TextDecoder().decode(bytes)),
		);
		if (!registry.success)
			return {
				status: "unavailable" as const,
				hashStatus,
				actualHash,
				message: "The published document is not a valid BCMR registry.",
			};
		const identity = getRegistryIdentity(registry.value, category);
		if (!identity)
			return {
				status: "unavailable" as const,
				hashStatus,
				actualHash,
				message:
					"The published registry has no current metadata for this token category.",
			};
		return {
			status: "ready" as const,
			hashStatus,
			actualHash,
			registry: registry.value,
			identity,
		};
	} catch {
		return {
			status: "unavailable" as const,
			message:
				"Metadata could not be read. The server may be unreachable, block browser requests, or return invalid JSON.",
		};
	}
}
