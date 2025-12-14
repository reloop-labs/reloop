import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { disableApiKeyHandler } from "@reloop/api-key/routes/api-key/controllers/disable-api-key";
import { Elysia, status, t } from "elysia";

export const disableApiKeyRoute = new Elysia().use(authMiddleware).post(
  "/:id/disable",
  async ({ params: { id }, user }) => {
    if (!user.activeOrganizationId) {
      throw status(403, {
        message: "User is not a member of an organization",
      });
    }
    return await disableApiKeyHandler(id, user.activeOrganizationId, user.id);
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
