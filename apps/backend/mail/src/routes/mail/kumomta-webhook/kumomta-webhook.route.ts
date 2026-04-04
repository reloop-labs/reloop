import { logger } from "@reloop/logger";
import { Elysia, t } from "elysia";
import {
  handleKumomtaWebhookController,
  type KumomtaLogRecord,
} from "./kumomta-webhook.controllers";

export const kumomtaWebhookRoute = new Elysia().post(
  "/webhook/kumomta",
  async (context) => {
    const { body } = context;
    const contextLogger = (context as any).logger;
    return await handleKumomtaWebhookController({
      events: body as KumomtaLogRecord[],
      logger: contextLogger || logger,
    });
  },
  {
    body: t.Array(
      t.Object({
        type: t.Union([
          t.Literal("Reception"),
          t.Literal("Delivery"),
          t.Literal("Bounce"),
          t.Literal("TransientFailure"),
          t.Literal("Expiration"),
          t.Literal("OOB"),
          t.Literal("Feedback"),
          t.Literal("AdminBounce"),
        ]),
        id: t.String(),
        sender: t.String(),
        recipient: t.String(),
        queue: t.String(),
        site: t.String(),
        size: t.Number(),
        bounce_classification: t.Optional(t.String()),
        response: t.Object({
          code: t.Number(),
          enhanced_code: t.Optional(
            t.Object({
              class: t.Number(),
              subject: t.Number(),
              detail: t.Number(),
            }),
          ),
          content: t.String(),
          command: t.Optional(t.String()),
        }),
        headers: t.Object({
          Subject: t.Optional(t.String()),
          "X-Org-ID": t.Optional(t.String()),
          "X-Domain-ID": t.Optional(t.String()),
          "X-Email-Log-ID": t.Optional(t.String()),
        }),
        timestamp: t.Optional(t.String()),
      }),
    ),
    response: {
      200: t.Object({
        processed: t.Number(),
        errors: t.Number(),
      }),
    },
    detail: {
      tags: ["Kumomta", "Internal"],
      summary: "KumoMTA webhooks",
      description:
        "Internal endpoint for KumoMTA to push event delivery/bounce logs.",
    },
  },
);
