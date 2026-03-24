import { binToHex, sha256, utf8ToBin } from "@bitauth/libauth";
import type { ErrorObject } from "ajv";
import type { GetAuthChainsQuery } from "~/graphql/graphql";
import { decodeAuthChain } from "~/module/bcmr";
import { opreturnToAuthChainElement } from "~/module/bitcoin";
import { validateBcmrSchema } from "~/module/utils";
import type { Registry } from "~/types";

const getRegistryTokenIdentity = (
	registry: Registry,
	tokenCategory: string,
) => {
	const tokenIdentities = registry.identities?.[tokenCategory];
	if (!tokenIdentities) {
		return;
	}

	const timestamp = Object.keys(tokenIdentities)
		.filter((revision) => +new Date(revision) < +new Date())
		.reduce(
			(timestamp1, timestamp2) =>
				new Date(timestamp1) > new Date(timestamp2) ? timestamp1 : timestamp2,
			"",
		);

	return timestamp ? tokenIdentities[timestamp] : undefined;
};

export type DoctorDiagnosis =
	| {
			status: "token-not-found";
	  }
	| {
			status: "authchain-not-found";
	  }
	| {
			status: "invalid-opreturn";
			opReturnHex: string;
			error: string;
	  }
	| {
			status: "fetch-error";
			opReturnHex: string;
			registryUrl: string;
			expectedHash: string;
			error: string;
	  }
	| {
			status: "json-parse-error";
			opReturnHex: string;
			registryUrl: string;
			expectedHash: string;
			actualHash: string;
			hashMatches: boolean;
			error: string;
			rawContent: string;
	  }
	| {
			status: "ok";
			opReturnHex: string;
			registryUrl: string;
			expectedHash: string;
			actualHash: string;
			hashMatches: boolean;
			schemaValid: boolean;
			schemaErrors: ErrorObject[];
			tokenFoundInRegistry: boolean;
			registry: Registry;
	  };

export const diagnoseRegistryFromAuthChain = async (
	authchain: GetAuthChainsQuery,
	tokenCategory: string,
): Promise<DoctorDiagnosis> => {
	const authchainElement = decodeAuthChain(authchain, tokenCategory);
	if (!authchain.transaction.length) {
		return {
			status: "token-not-found",
		};
	}

	if (!authchainElement?.opreturn) {
		return {
			status: "authchain-not-found",
		};
	}

	const parsedOpReturn = opreturnToAuthChainElement(authchainElement.opreturn);
	if (typeof parsedOpReturn === "string") {
		return {
			status: "invalid-opreturn",
			opReturnHex: authchainElement.opreturn,
			error: parsedOpReturn,
		};
	}

	const { url: registryUrl, contentHash: expectedHash } = parsedOpReturn;

	let response: Response;
	try {
		response = await fetch(registryUrl);
	} catch (error) {
		return {
			status: "fetch-error",
			opReturnHex: authchainElement.opreturn,
			registryUrl,
			expectedHash,
			error:
				error instanceof Error ? error.message : "Failed to fetch registry",
		};
	}

	if (!response.ok) {
		return {
			status: "fetch-error",
			opReturnHex: authchainElement.opreturn,
			registryUrl,
			expectedHash,
			error: `Registry returned HTTP ${response.status}`,
		};
	}

	const rawContent = await response.text();
	const actualHash = binToHex(sha256.hash(utf8ToBin(rawContent)));
	const hashMatches = actualHash === expectedHash;

	let registry: unknown;
	try {
		registry = JSON.parse(rawContent);
	} catch (error) {
		return {
			status: "json-parse-error",
			opReturnHex: authchainElement.opreturn,
			registryUrl,
			expectedHash,
			actualHash,
			hashMatches,
			error: error instanceof Error ? error.message : "Invalid JSON",
			rawContent,
		};
	}

	const schemaResult = await validateBcmrSchema(registry);
	return {
		status: "ok",
		opReturnHex: authchainElement.opreturn,
		registryUrl,
		expectedHash,
		actualHash,
		hashMatches,
		schemaValid: schemaResult.success,
		schemaErrors: schemaResult.success ? [] : [...(schemaResult.value || [])],
		tokenFoundInRegistry:
			schemaResult.success &&
			!!getRegistryTokenIdentity(schemaResult.value, tokenCategory),
		registry: schemaResult.success
			? schemaResult.value
			: (registry as Registry),
	};
};
