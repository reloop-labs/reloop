import { createOpenAPI } from "fumadocs-openapi/server";

export const openapi = createOpenAPI({
	input: ["https://local.reloop.sh/api/contacts/openapi/json"],
});
