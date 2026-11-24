import { describe, expect, test } from "bun:test";
import {
	ApolloClient,
	ApolloLink,
	InMemoryCache,
	Observable,
} from "@apollo/client/core";
import { provideApolloClient } from "@vue/apollo-composable";
import { parse } from "graphql";
import { computed, effectScope, nextTick, ref, watch } from "vue";

// Nuxt auto-imports used by the modules under test.
Object.assign(globalThis, { ref, computed, watch });
// Own document: other test files stub the shared `gql` auto-import.
const GetAuthChains = parse(
	"query GetAuthChains($network: String, $tokenCategory: [bytea!]) { transaction(where: { hash: { _in: $tokenCategory } }) { hash } }",
);
const { isTokenCategoryTransaction } = await import("../src/module/bcmr");
const { useScopedQuery } = await import("../src/hooks/scopedQuery");

const genesis = (outputs: unknown[][]) => ({
	category_genesis: outputs.map((tokenOutputs) => ({
		spent_by: [{ transaction: { outputs: tokenOutputs } }],
	})),
});

describe("isTokenCategoryTransaction", () => {
	test("is true only when the spender of output 0 created this category", () => {
		expect(isTokenCategoryTransaction(genesis([[{ output_index: "1" }]]))).toBe(
			true,
		);
		expect(isTokenCategoryTransaction(genesis([[]]))).toBe(false);
		expect(isTokenCategoryTransaction({ category_genesis: [] })).toBe(false);
		expect(
			isTokenCategoryTransaction({ category_genesis: [{ spent_by: [] }] }),
		).toBe(false);
		expect(isTokenCategoryTransaction(undefined)).toBe(false);
	});
});

describe("useScopedQuery enabled flag", () => {
	test("sends no request while disabled and one once enabled", async () => {
		const requests: unknown[] = [];
		const client = new ApolloClient({
			cache: new InMemoryCache(),
			link: new ApolloLink(
				(operation) =>
					new Observable((observer) => {
						requests.push(operation.variables);
						observer.next({ data: { transaction: [] } });
						observer.complete();
					}),
			),
		});
		const categories = ref<`\\x${string}`[]>([]);
		const scope = effectScope();
		const query = scope.run(() =>
			provideApolloClient(client)(() =>
				useScopedQuery(
					GetAuthChains,
					computed(() => ({
						network: "mainnet",
						tokenCategory: categories.value,
					})),
					() => categories.value.length > 0,
				),
			),
		);
		if (!query) throw new Error("query not created");

		await nextTick();
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(requests).toEqual([]);
		expect(query.loading.value).toBe(false);
		expect(query.result.value).toBeUndefined();

		categories.value = ["\\xabcd"];
		await nextTick();
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(requests).toEqual([
			{ network: "mainnet", tokenCategory: ["\\xabcd"] },
		]);

		categories.value = [];
		await nextTick();
		expect(query.result.value).toBeUndefined();
		expect(query.loading.value).toBe(false);
		scope.stop();
	});
});
