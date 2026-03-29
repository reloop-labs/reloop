import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { Elysia, status, t } from "elysia";
import { updateApiKeyHandler } from "./update-api-key.controllers";

export const updateApiKeyRoute = new Elysia().use(authMiddleware).patch(
	"/:id",
	async ({ params: { id }, body, activeOrganizationId, userId }) => {
		if (!activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await updateApiKeyHandler(
			id,
			activeOrganizationId!,
			userId!,
			body,
		);
	},
	{
		auth: true,
		params: t.Object({
			id: ApiKeyModel.apiKeyIdParam,
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
		},
	},
);
