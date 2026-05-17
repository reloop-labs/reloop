import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { rateLimitPlugin } from "@reloop/api-key/middleware/rate-limit";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { Elysia, t } from "elysia";
import { enableApiKeyController } from "./enable-api-key.controllers";
import { enableApiKeyXCodeSamples } from "./enable-api-key.x-codeSamples";

export const enableApiKeyRoute = new Elysia()

	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "enable" }))
	.post(
		"/enable/:api_key_id",
		async ({ params: { api_key_id }, organizationId }) => {
			return await enableApiKeyController({
				id: api_key_id,
				organizationId,
			});
		},
		{
			auth: true,
			rateLimit: true,
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
				"x-codeSamples": enableApiKeyXCodeSamples,
			},
		},
	);
