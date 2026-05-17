import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { rateLimitPlugin } from "@reloop/api-key/middleware/rate-limit";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { Elysia, t } from "elysia";
import { disableApiKeyController } from "./disable-api-key.controllers";

export const disableApiKeyRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "disable" }))
	.post(
		"/disable/:api_key_id",
		async ({ params: { api_key_id }, organizationId }) => {
			return await disableApiKeyController({
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
				summary: "Disable API key",
				description: "Disables an API key without deleting it (soft revoke)",
			},
		},
	);
