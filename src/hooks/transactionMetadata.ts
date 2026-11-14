import { binToHex, hexToBin, sha256 } from "@bitauth/libauth";
import { type MaybeRefOrGetter, ref, toValue, watch } from "vue";
import type { getTransactionTokenPublication } from "~/module/bcmr";
import { opreturnToAuthChainElement, parseBinary } from "~/module/bitcoin";
import { validateBcmrSchema } from "~/module/utils";
import type { IdentitySnapshot } from "~/types";
export function useTransactionMetadata(
	publication: MaybeRefOrGetter<
		ReturnType<typeof getTransactionTokenPublication>
	>,
	network: MaybeRefOrGetter<string>,
) {
	const identity = ref<IdentitySnapshot>();
	const loading = ref(false);
	watch(
		() => [toValue(publication), toValue(network)] as const,
		async ([current], _, onCleanup) => {
			const controller = new AbortController();
			onCleanup(() => controller.abort());
			identity.value = undefined;
			loading.value = false;
			if (!current) return;
			const decoded = opreturnToAuthChainElement(current.opreturn);
			if (typeof decoded === "string") return;
			loading.value = true;
			try {
				const response = await fetch(decoded.url, {
					signal: controller.signal,
				});
				if (!response.ok) return;
				const bytes = new Uint8Array(await response.arrayBuffer());
				if (
					parseBinary(hexToBin(current.opreturn)).length >= 3 &&
					binToHex(sha256.hash(bytes)) !== decoded.contentHash
				)
					return;
				const registry = await validateBcmrSchema(
					JSON.parse(new TextDecoder().decode(bytes)),
				);
				if (!registry.success || controller.signal.aborted) return;
				const history = registry.value.identities?.[current.category];
				const revision =
					history &&
					Object.keys(history)
						.filter((time) => Date.parse(time) <= Date.now())
						.sort((a, b) => Date.parse(b) - Date.parse(a))
						.at(0);
				const selected = revision && history?.[revision];
				if (selected && selected.token?.category === current.category)
					identity.value = selected;
			} catch {
				/* Unavailable metadata leaves the transaction visible. */
			} finally {
				if (!controller.signal.aborted) loading.value = false;
			}
		},
		{ immediate: true, flush: "sync" },
	);
	return { identity, loading };
}
