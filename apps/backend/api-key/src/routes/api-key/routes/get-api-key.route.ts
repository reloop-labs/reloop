import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { getApiKeyHandler } from "@reloop/api-key/routes/api-key/controllers/get-api-key";
import { Elysia, status, t } from "elysia";

export const getApiKeyRoute = new Elysia().use(authMiddleware).get(
	"/:id",
	async ({ params: { id }, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await getApiKeyHandler(id, user.activeOrganizationId, user.id);
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
			summary: "Get API key by ID",
			description: "Retrieves an API key by its ID",
		},
	},
);
