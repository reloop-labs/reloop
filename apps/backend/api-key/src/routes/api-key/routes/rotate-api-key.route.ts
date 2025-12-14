import { authMiddleware } from "@reloop/api-key/middleware/auth";
import { ApiKeyModel } from "@reloop/api-key/model/api-key.model";
import { rotateApiKeyHandler } from "@reloop/api-key/routes/api-key/controllers/rotate-api-key";
import { Elysia, status, t } from "elysia";

export const rotateApiKeyRoute = new Elysia().use(authMiddleware).post(
  "/:id/rotate",
  async ({ params: { id }, user }) => {
    if (!user.activeOrganizationId) {
      throw status(403, {
        message: "User is not a member of an organization",
      });
    }
    return await rotateApiKeyHandler(id, user.activeOrganizationId, user.id);
  },
  {
    auth: true,
    params: t.Object({
      id: ApiKeyModel.apiKeyIdParam,
    }),
    response: {
      200: ApiKeyModel.apiKeyWithKeyResponse,
      404: ApiKeyModel.apiKeyNotFound,
      403: ApiKeyModel.unauthorized,
    },
    detail: {
      tags: ["API Keys"],
      summary: "Rotate API key",
      description:
        "Generates a new secret for the API key while keeping the same ID",
    },
  },
);
