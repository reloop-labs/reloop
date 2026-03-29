import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { Elysia, status, t } from "elysia";
import { disableApiKeyHandler } from "./disable-api-key.controllers";

export const disableApiKeyRoute = new Elysia().use(authMiddleware).post(
	"/:id/disable",
	async ({ params: { id }, activeOrganizationId, userId }) => {
		if (!activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await disableApiKeyHandler(id, activeOrganizationId!, userId!);
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
