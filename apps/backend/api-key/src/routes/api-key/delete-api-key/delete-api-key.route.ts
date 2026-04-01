import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { Elysia, t } from "elysia";
import { deleteApiKeyController } from "./delete-api-key.controllers";
import { deleteApiKeyXCodeSamples } from "./delete-api-key.x-codeSamples";

export const deleteApiKeyRoute = new Elysia().use(authMiddleware).delete(
	"/:api_key_id",
	async ({ params: { api_key_id }, activeOrganizationId, userId, logger, path, request, headers }) => {
		const cookieString = headers["cookie"] || "";
		return await deleteApiKeyController({
			apiKeyId: api_key_id,
			organizationId: activeOrganizationId,
			logger,
			cookie: cookieString,
			requestDetails: {
				endpoint: path,
				method: request.method,
				userAgent: headers["user-agent"],
				ipAddress: (headers["x-forwarded-for"] as string) || (headers["x-real-ip"] as string),
			},
		});
	},
	{
		auth: true,
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
	},
);
