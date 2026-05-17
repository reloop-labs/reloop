import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { Elysia, t } from "elysia";
import { getApiKeyController } from "./get-api-key.controllers";
import { getApiKeyXCodeSamples } from "./get-api-key.x-codeSamples";

export const getApiKeyRoute = new Elysia().use(authMiddleware).get(
	"/:api_key_id",
	async ({ params: { api_key_id }, organizationId }) => {
		return await getApiKeyController({
			apiKeyId: api_key_id,
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
			summary: "Retrieve API key",
			description: "Retrieves an API key by its ID",
			"x-codeSamples": getApiKeyXCodeSamples,
		},
	},
);
