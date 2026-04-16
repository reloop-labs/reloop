import { type Logger, logger } from "@reloop/logger";
import { Elysia, t } from "elysia";
import { verifyApiKeyController } from "./verify-api-key.controllers";

export const verifyApiKeyRoute = new Elysia().post(
  "/auth/verify",
  async (context) => {
    const apiKey = context.body.key;

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
    body: t.Object({
      key: t.String(),
    }),
    detail: {
      summary: "API Key Verification",
      description:
        "Internal verification endpoint mapping POST API keys to their owner.",
    },
  },
);
