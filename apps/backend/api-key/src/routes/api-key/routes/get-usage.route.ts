import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { getUsageStatsHandler } from "@reloop/api-key/routes/api-key/controllers/get-usage";
import { Elysia, status, t } from "elysia";

export const getUsageRoute = new Elysia().use(authMiddleware).get(
  "/:id/usage",
  async ({ params: { id }, user }) => {
    if (!user.activeOrganizationId) {
      throw status(403, {
        message: "User is not a member of an organization",
      });
    }
    return await getUsageStatsHandler(id, user.activeOrganizationId, user.id);
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
