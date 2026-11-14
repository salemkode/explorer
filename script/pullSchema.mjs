import { writeFile } from "node:fs/promises";
import { buildClientSchema, getIntrospectionQuery, printSchema } from "graphql";

const endpoint =
	process.env.CHAINGRAPH_HTTP || "https://gql.chaingraph.pat.mn/v1/graphql";
const response = await fetch(endpoint, {
	method: "POST",
	headers: { "content-type": "application/json" },
	body: JSON.stringify({ query: getIntrospectionQuery() }),
	signal: AbortSignal.timeout(30_000),
});
if (!response.ok) throw new Error(`Schema request failed: ${response.status}`);
const result = await response.json();
if (result.errors?.length) throw new Error(JSON.stringify(result.errors));
const schema = buildClientSchema(result.data);
await writeFile("schema/chaingraph.graphql", `${printSchema(schema)}\n`);
console.log("Updated schema/chaingraph.graphql");
