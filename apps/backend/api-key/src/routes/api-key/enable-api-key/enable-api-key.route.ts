import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { Elysia, t } from "elysia";
import { enableApiKeyController } from "./enable-api-key.controllers";

export const enableApiKeyRoute = new Elysia().use(authMiddleware).post(
	"/enable/:api_key_id",
	async ({
		params: { api_key_id },
		organizationId,
	}) => {
		return await enableApiKeyController({
			id: api_key_id,
			organizationId,
		});
	},
	{
		auth: true,
		params: t.Object({
			api_key_id: ApiKeyModel.apiKeyIdParam,
		}),
		response: {
			200: ApiKeyModel.apiKeyResponse,
			404: ApiKeyModel.apiKeyNotFound,
			403: ApiKeyModel.unauthorized,
		},
		detail: {
			tags: ["API Keys"],
			summary: "Enable API key",
			description: "Enables a previously disabled API key",
		},
	},
);
