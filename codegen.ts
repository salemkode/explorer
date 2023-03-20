import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/graphql/schema.graphql",
  documents: ["src/module/chaingraph.ts"],
  config: {
    scalars: {
      bytea: "string",
      bigint: "string",
      timestamp: "number",
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
