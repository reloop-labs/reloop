import { generateFiles } from "fumadocs-openapi";

const API_URL = "https://reloop.sh/api/auth/docs/json";

//void generateFiles({
//	input: [API_URL],
//	output: "./content/docs/service/auth/",
//	includeDescription: true,
//});

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
