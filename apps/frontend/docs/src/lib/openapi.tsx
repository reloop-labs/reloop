import { createOpenAPI } from "fumadocs-openapi/server";

export const services = {
	contacts: createOpenAPI({
		input: ["https://reloop.sh/api/contacts/openapi/json"],
	}),
	"api-key": createOpenAPI({
		input: ["https://reloop.sh/api/api-key/openapi/json"],
	}),
	domain: createOpenAPI({
		input: ["https://reloop.sh/api/domain/openapi/json"],
	}),
};

export const openapi = services.domain;
