import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { rateLimitPlugin } from "@reloop/api-key/middleware/rate-limit";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { auditLogHook } from "@reloop/api-key/utils/audit-log";
import { Elysia, t } from "elysia";
import { deleteApiKeyController } from "./delete-api-key.controllers";
import { deleteApiKeyXCodeSamples } from "./delete-api-key.x-codeSamples";

export const deleteApiKeyRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 20, windowSeconds: 60, namespace: "delete" }))
	.delete(
		"/:api_key_id",
		async ({ params: { api_key_id }, organizationId }) => {
			return await deleteApiKeyController({
				apiKeyId: api_key_id,
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
				200: ApiKeyModel.deleteApiKeyResponse,
				404: ApiKeyModel.apiKeyNotFound,
				403: ApiKeyModel.unauthorized,
			},
			detail: {
				tags: ["API Keys"],
				summary: "Delete API key",
				description: "Deletes an API key",
				"x-codeSamples": deleteApiKeyXCodeSamples,
			},
			afterResponse: auditLogHook({ action: "deleted" }),
		},
	);
