import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { Elysia, t } from "elysia";
import { updateApiKeyController } from "./update-api-key.controllers";
import { updateApiKeyXCodeSamples } from "./update-api-key.x-codeSamples";

export const updateApiKeyRoute = new Elysia().use(authMiddleware).patch(
	"/:api_key_id",
	async ({
		params: { api_key_id },
		body: { name },
		organizationId,
	}) => {
		return await updateApiKeyController({
			apiKeyId: api_key_id,
			organizationId,
			name,
		});
	},
	{
		auth: true,
		params: t.Object({
			api_key_id: ApiKeyModel.apiKeyIdParam,
		}),
		body: ApiKeyModel.updateApiKeyBody,
		response: {
			200: ApiKeyModel.apiKeyResponse,
			404: ApiKeyModel.apiKeyNotFound,
			403: ApiKeyModel.unauthorized,
		},
		detail: {
			tags: ["API Keys"],
			summary: "Update API key",
			description: "Updates an existing API key",
			"x-codeSamples": updateApiKeyXCodeSamples,
		},
	},
);
