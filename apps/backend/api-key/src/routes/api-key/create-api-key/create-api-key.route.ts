import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { rateLimitPlugin } from "@reloop/api-key/middleware/rate-limit";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { auditLogHook } from "@reloop/api-key/utils/audit-log";
import { createApiKeyXCodeSamples } from "@reloop/code-samples/api-key";
import { Elysia } from "elysia";
import { createApiKeyController } from "./create-api-key.controllers";

export const createApiKeyRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 10, windowSeconds: 60, namespace: "create" }))
	.post(
		"/",
		async ({ body: { name }, organizationId, userId, set }) => {
			set.status = 201;
			return await createApiKeyController({
				organizationId,
				userId,
				name,
			});
		},
		{
			auth: true,
			rateLimit: true,
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
			afterResponse: auditLogHook({ action: "created", successStatus: 201 }),
		},
	);
