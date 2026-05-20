import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { rateLimitPlugin } from "@reloop/api-key/middleware/rate-limit";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { auditLogHook } from "@reloop/api-key/utils/audit-log";
import { Elysia, t } from "elysia";
import { rotateApiKeyController } from "./rotate-api-key.controllers";
import { rotateApiKeyXCodeSamples } from "./rotate-api-key.x-codeSamples";

export const rotateApiKeyRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 20, windowSeconds: 60, namespace: "rotate" }))
	.post(
		"/rotate/:api_key_id",
		async ({ params: { api_key_id }, organizationId }) => {
			return await rotateApiKeyController({
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
				200: ApiKeyModel.apiKeyWithKeyResponse,
				404: ApiKeyModel.apiKeyNotFound,
				403: ApiKeyModel.unauthorized,
			},
			detail: {
				tags: ["API Keys"],
				summary: "Rotate API key",
				description:
					"Generates a new secret for the API key while keeping the same ID",
				"x-codeSamples": rotateApiKeyXCodeSamples,
			},
			afterResponse: auditLogHook({ action: "rotated" }),
		},
	);
