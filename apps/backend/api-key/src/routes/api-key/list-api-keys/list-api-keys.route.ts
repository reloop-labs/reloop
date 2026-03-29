import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { Elysia } from "elysia";
import { listApiKeysController } from "./list-api-keys.controllers";
import { listApiKeysXCodeSamples } from "./list-api-keys.x-codeSamples";

export const listApiKeysRoute = new Elysia().use(authMiddleware).get(
	"/",
	async ({ query, activeOrganizationId, logger }) => {
		return await listApiKeysController({
			query,
			organizationId: activeOrganizationId,
			logger,
		});
	},
	{
		auth: true,
		query: ApiKeyModel.apiKeyQuery,
		response: {
			200: ApiKeyModel.apiKeyListResponse,
			403: ApiKeyModel.unauthorized,
		},
		detail: {
			tags: ["API Keys"],
			summary: "List API keys",
			description: "Lists all API keys for the user's organization",
			"x-codeSamples": listApiKeysXCodeSamples,
		},
	},
);
