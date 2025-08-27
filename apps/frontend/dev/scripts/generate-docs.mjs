import { generateFiles } from "fumadocs-openapi";

void generateFiles({
	// the OpenAPI schema, you can also give it an external URL.
	input: ["https://reloop.sh/api/auth/docs/json"],
	output: "./content/docs/setup/backend/auth/",
	// we recommend to enable it
	// make sure your endpoint description doesn't break MDX syntax.
	includeDescription: true,
});
