import { writeFileSync } from "fs";
import { generateFiles } from "fumadocs-openapi";

const API_URL = "https://reloop.sh/api/auth/docs/json";

// Download the OpenAPI schema locally
async function downloadSchema() {
	try {
		const response = await fetch(API_URL);
		if (!response.ok) {
			throw new Error(`Failed to fetch schema: ${response.status}`);
		}
		const schema = await response.json();
		writeFileSync("./openapi.json", JSON.stringify(schema, null, 2));
		console.log("Downloaded OpenAPI schema to ./openapi.json");
	} catch (error) {
		console.error("Failed to download schema:", error);
		// Continue with generation even if download fails
	}
}

// Download schema first, then generate files
await downloadSchema();

// Generate auth service API documentation
void generateFiles({
	// the OpenAPI schema, you can also give it an external URL.
	input: [API_URL],
	output: "./content/docs/service/auth/",
	// we recommend to enable it
	// make sure your endpoint description doesn't break MDX syntax.
	includeDescription: true,
});

// TODO: Add generation for other services when their OpenAPI specs are available
// Example for mail service:
// void generateFiles({
//   input: ["https://reloop.sh/api/mail/docs/json"],
//   output: "./content/docs/service/mail/",
//   includeDescription: true,
// });

// Example for webhook service:
// void generateFiles({
//   input: ["https://reloop.sh/api/webhook/docs/json"],
//   output: "./content/docs/service/webhook/",
//   includeDescription: true,
// });

// Example for server service:
// void generateFiles({
//   input: ["https://reloop.sh/api/server/docs/json"],
//   output: "./content/docs/service/server/",
//   includeDescription: true,
// });
