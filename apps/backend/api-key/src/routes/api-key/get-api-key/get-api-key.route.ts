import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { Elysia, t } from "elysia";
import { getApiKeyController } from "./get-api-key.controllers";
import { getApiKeyXCodeSamples } from "./get-api-key.x-codeSamples";

export const getApiKeyRoute = new Elysia().use(authMiddleware).get(
	"/:id",
	async ({ params: { id }, activeOrganizationId, userId, logger }) => {
		return await getApiKeyController({
			apiKeyId: id,
			organizationId: activeOrganizationId,
			userId,
			logger,
		});
	},
	{
		auth: true,
		params: t.Object({
			id: ApiKeyModel.apiKeyIdParam,
		}),
		response: {
			200: ApiKeyModel.apiKeyResponse,
			404: ApiKeyModel.apiKeyNotFound,
			403: ApiKeyModel.unauthorized,
		},
		detail: {
			tags: ["API Keys"],
			summary: "Get API key by ID",
			description: "Retrieves an API key by its ID",
			"x-codeSamples": getApiKeyXCodeSamples,
		},
	},
);
