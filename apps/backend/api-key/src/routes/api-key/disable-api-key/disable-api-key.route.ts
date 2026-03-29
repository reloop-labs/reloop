import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { Elysia, t } from "elysia";
import { disableApiKeyController } from "./disable-api-key.controllers";

export const disableApiKeyRoute = new Elysia().use(authMiddleware).post(
	"/:id/disable",
	async ({ params: { id }, activeOrganizationId, userId, logger }) => {
		return await disableApiKeyController({
			id,
			organizationId: activeOrganizationId,
			userId,
			logger,
		});
	},
	{
		auth: true,
		params: t.Object({
			id: ApiKeyModel.apiKeyIdParam,
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
