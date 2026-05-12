import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../server/src/schema.gql",
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "src/generated/graphql.ts": {
      plugins: ["typescript-operations", "typescript-urql"],
      config: { withHooks: true },
    },
  },
};

export default config;
