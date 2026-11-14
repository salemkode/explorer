import type { CodegenConfig } from "@graphql-codegen/cli";

export default {
	schema: "./schema/chaingraph.graphql",
	documents: ["src/**/*.{ts,vue}", "!src/**/*.d.ts", "!src/graphql/**"],
	config: {
		scalars: {
			bytea: "bytea",
			bigint: "string",
			timestamp: "number",
			enum_nonfungible_token_capability: '"none" | "mutable" | "minting"',
		},
	},
	generates: {
		"./src/graphql/": {
			preset: "client",
			plugins: [
				{
					add: {
						content: 'import type { bytea } from "~/types/index";',
					},
				},
			],
			config: {
				useTypeImports: true,
			},
			presetConfig: {
				gqlTagName: "gql",
			},
		},
	},
} satisfies CodegenConfig;
