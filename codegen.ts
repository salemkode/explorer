import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/graphql/schema.graphql",
  documents: ["src/module/chaingraph.ts"],
  config: {
    scalars: {
      bytea: "bytea",
      bigint: "string",
      timestamp: "number",
      // eslint-disable-next-line quotes
      enum_nonfungible_token_capability: '"none" | "mutable" | "minting"',
    },
  },
  generates: {
    "./src/graphql/": {
      preset: "client",
      plugins: [
        {
          add: {
            // eslint-disable-next-line quotes
            content: 'import type { bytea } from "~/types/index";',
          },
        },
      ],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
