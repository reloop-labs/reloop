import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { Elysia, status, t } from "elysia";
import { getUsageStatsHandler } from "./get-usage.controllers";

export const getUsageRoute = new Elysia().use(authMiddleware).get(
	"/:id/usage",
	async ({ params: { id }, activeOrganizationId, userId }) => {
		if (!activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await getUsageStatsHandler(id, activeOrganizationId!, userId!);
	},
	{
		auth: true,
		params: t.Object({
			id: ApiKeyModel.apiKeyIdParam,
		}),
		response: {
			200: ApiKeyModel.usageStatsResponse,
			404: ApiKeyModel.apiKeyNotFound,
			403: ApiKeyModel.unauthorized,
		},
		detail: {
			tags: ["API Keys"],
			summary: "Get API key usage",
			description: "Retrieves usage statistics for an API key",
		},
	},
);
