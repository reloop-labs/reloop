import { createOpenAPI } from "fumadocs-openapi/server";

export const openapi = createOpenAPI({
	input: ["http://localhost:8014/api/contacts/openapi/json"],
});
