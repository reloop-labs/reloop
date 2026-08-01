import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { listApiKeysXCodeSamples } from "@reloop/code-samples/api-key";
import { Elysia } from "elysia";
import { listApiKeysController } from "./list-api-keys.controllers";

export const listApiKeysRoute = new Elysia().use(authMiddleware).get(
	"/",
	async ({ query, organizationId }) => {
		return await listApiKeysController({
			query,
			organizationId,
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
