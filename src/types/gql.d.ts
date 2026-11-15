import type { gql as gqlType } from "@/graphql/gql";

declare global {
	const gql: typeof gqlType;
}
