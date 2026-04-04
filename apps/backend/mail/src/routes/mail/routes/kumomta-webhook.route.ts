import { handleKumomtaWebhook } from "@reloop/be-mail/routes/mail/controllers/kumomta-webhook.js";
import { logger } from "@reloop/logger";
import { Elysia, t } from "elysia";

/**
 * KumoMTA webhook endpoint — receives delivery/bounce/failure events.
 * This route is UNAUTHENTICATED because KumoMTA's log_hooks send
 * requests internally from the Docker network.
 */
export const kumomtaWebhookRoute = new Elysia().post(
  "/kumomta/webhook",
  async ({ body }) => {
    // KumoMTA log_hooks sends events as a JSON array
    const events = Array.isArray(body) ? body : [body];

    logger.info(
      { eventCount: events.length },
      "Received KumoMTA webhook events",
    );

    const result = await handleKumomtaWebhook(events);

    return {
      success: true,
      ...result,
    };
  },
  {
    body: t.Union([
      t.Array(t.Any()),
      t.Any(),
    ]),
    detail: {
      tags: ["KumoMTA"],
      summary: "KumoMTA delivery webhook",
      description:
        "Internal endpoint for KumoMTA log_hooks to report delivery, bounce, and failure events",
    },
  },
);
