import { type Logger, logger } from "@reloop/logger";
import { Elysia, t } from "elysia";
import { verifyApiKeyController } from "./verify-api-key.controllers";

export const verifyApiKeyRoute = new Elysia().get(
  "/auth/verify",
  async (context) => {
    // Check Authorization header or x-api-key directly
    const authHeader = context.request.headers.get("authorization");
    let apiKey = context.request.headers.get("x-api-key");
    if (authHeader?.startsWith("Bearer ")) {
      apiKey = authHeader.substring(7);
    }

    if (!apiKey) {
      return context.status(401, { message: "API key missing" });
    }

    const contextLogger = (context as { logger?: Logger }).logger;
    const result = await verifyApiKeyController({
      apiKey,
      logger: contextLogger || logger,
    });

    if (!result) {
      return context.status(401, { message: "Invalid API key" });
    }

    return result;
  },
  {
    response: {
      200: t.Object({
        userId: t.String(),
        activeOrganizationId: t.String(),
      }),
      401: t.Object({
        message: t.String(),
      }),
    },
    detail: {
      tags: ["Kumomta", "Internal", "Auth"],
      summary: "Verify API Key",
      description:
        "Internal verification endpoint mapping HTTP API keys to their owner.",
    },
  },
);
