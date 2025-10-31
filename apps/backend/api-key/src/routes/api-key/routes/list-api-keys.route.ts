import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { listApiKeysHandler } from "@reloop/api-key/routes/api-key/controllers/list-api-keys";
import { ApiKeyModel } from "@reloop/api-key/routes/api-key/api-key.model";
import { Elysia, status } from "elysia";

export const listApiKeysRoute = new Elysia().use(authMiddleware).get(
	"/",
	async ({ query, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await listApiKeysHandler(query, user.activeOrganizationId, user.id);
	},
	{
		auth: true,
		query: ApiKeyModel.apiKeyQuery,
		response: {
			200: ApiKeyModel.apiKeyListResponse,
			403: ApiKeyModel.unauthorized,
		},
		detail: {
			tags: ["API Keys"],
			summary: "List API keys",
			description: "Lists all API keys for the user's organization",
		},
	},
);

