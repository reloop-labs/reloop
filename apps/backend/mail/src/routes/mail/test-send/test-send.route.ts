import { Elysia, t } from "elysia";
import { testKumomtaSendController } from "./test-send.controllers";

export const testSendRoute = new Elysia().get(
  "/hard-send",
  async () => {
    return await testKumomtaSendController();
  },
  {
    response: {
      200: t.Object({
        success: t.Boolean(),
        messageId: t.Optional(t.String()),
        response: t.Optional(t.String()),
        timestamp: t.String(),
        config: t.Object({
          from: t.String(),
          to: t.String(),
          subject: t.String(),
        }),
        error: t.Optional(t.String()),
      }),
    },
    detail: {
      tags: ["Mail", "Health Check"],
      summary: "Test Kumomta mail server",
      description:
        "Sends a test email with hardcoded values to verify Kumomta functionality. No authentication required.",
    },
  },
);
