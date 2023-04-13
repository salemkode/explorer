import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/graphql/schema.graphql",
  documents: ["src/module/chaingraph.ts"],
  config: {
    scalars: {
      bytea: "string",
      bigint: "string",
      timestamp: "number",
      // eslint-disable-next-line prettier/prettier
      enum_nonfungible_token_capability: "\"none\" | \"mutable\" | \"minting\"",
    },
  },
  generates: {
    "./src/graphql/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
