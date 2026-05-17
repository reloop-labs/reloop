import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { Elysia, t } from "elysia";
import { rotateApiKeyController } from "./rotate-api-key.controllers";

export const rotateApiKeyRoute = new Elysia().use(authMiddleware).post(
	"/rotate/:api_key_id",
	async ({
		params: { api_key_id },
		activeOrganizationId,
		logger,
		headers,
	}) => {
		const cookieString = headers["cookie"] || "";
		return await rotateApiKeyController({
			id: api_key_id,
			organizationId: activeOrganizationId,
			cookie: cookieString,
		});
	},
	{
		auth: true,
		params: t.Object({
			api_key_id: ApiKeyModel.apiKeyIdParam,
		}),
		response: {
			200: ApiKeyModel.apiKeyWithKeyResponse,
			404: ApiKeyModel.apiKeyNotFound,
			403: ApiKeyModel.unauthorized,
		},
		detail: {
			tags: ["API Keys"],
			summary: "Rotate API key",
			description:
				"Generates a new secret for the API key while keeping the same ID",
		},
	},
);
