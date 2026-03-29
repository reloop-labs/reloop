import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { Elysia } from "elysia";
import { createApiKeyController } from "./create-api-key.controllers";
import { createApiKeyXCodeSamples } from "./create-api-key.x-codeSamples";

export const createApiKeyRoute = new Elysia().use(authMiddleware).post(
	"/",
	async ({ body, activeOrganizationId, userId, logger }) => {
		return await createApiKeyController({
			organizationId: activeOrganizationId,
			userId,
			body,
			logger,
		});
	},
	{
		auth: true,
		body: ApiKeyModel.createApiKeyBody,
		response: {
			201: ApiKeyModel.apiKeyWithKeyResponse,
			403: ApiKeyModel.unauthorized,
		},
		detail: {
			tags: ["API Keys"],
			summary: "Create API Key",
			description: "Creates a new API key",
			"x-codeSamples": createApiKeyXCodeSamples,
		},
	},
);
