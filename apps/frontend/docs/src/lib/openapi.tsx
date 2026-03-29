import { createOpenAPI } from "fumadocs-openapi/server";

export const services = {
	contacts: createOpenAPI({
		input: ["http://localhost:8014/api/contacts/openapi/json"],
		disableCache: true,
	}),
	"api-key": createOpenAPI({
		input: ["http://localhost:8012/api/api-key/openapi/json"],
		disableCache: true,
	}),
};

export const openapi = services.contacts;
