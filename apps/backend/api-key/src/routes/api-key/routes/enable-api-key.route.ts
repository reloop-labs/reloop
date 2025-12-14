import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { enableApiKeyHandler } from "@reloop/api-key/routes/api-key/controllers/enable-api-key";
import { Elysia, status, t } from "elysia";

export const enableApiKeyRoute = new Elysia().use(authMiddleware).post(
  "/:id/enable",
  async ({ params: { id }, user }) => {
    if (!user.activeOrganizationId) {
      throw status(403, {
        message: "User is not a member of an organization",
      });
    }
    return await enableApiKeyHandler(id, user.activeOrganizationId, user.id);
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
      summary: "Enable API key",
      description: "Enables a previously disabled API key",
    },
  },
);
