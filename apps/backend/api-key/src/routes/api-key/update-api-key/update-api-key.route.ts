import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { rateLimitPlugin } from "@reloop/api-key/middleware/rate-limit";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { assertCanManageApiKeys } from "@reloop/api-key/utils/api-key-scope";
import { auditLogHook } from "@reloop/api-key/utils/audit-log";
import { updateApiKeyXCodeSamples } from "@reloop/code-samples/api-key";
import { Elysia, t } from "elysia";
import { updateApiKeyController } from "./update-api-key.controllers";

export const updateApiKeyRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "update" }))
	.patch(
		"/:api_key_id",
		async ({
			params: { api_key_id },
			body: { name, scope },
			organizationId,
			authType,
			apiKeyId,
		}) => {
			await assertCanManageApiKeys({ authType, apiKeyId });
			return await updateApiKeyController({
				apiKeyId: api_key_id,
				organizationId,
				name,
				scope,
			});
		},
		{
			auth: true,
			rateLimit: true,
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
			afterResponse: auditLogHook({ action: "updated" }),
		},
	);
