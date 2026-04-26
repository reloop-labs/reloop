import { Elysia, t } from "elysia";
import { logIncomingController } from "./log-incoming.controllers";

export const logIncomingRoute = new Elysia().post(
  "/log-incoming",
  async ({ body, status }) => {
    const result = await logIncomingController(body);
    if (result.error) {
      if (result.code === 401) {
        return status(401, { message: result.error });
      }
      if (result.code === 404) {
        return status(404, { message: result.error });
      }
      if (result.code === 409) {
        return status(409, { message: result.error });
      }
      return status(500, { message: result.error });
    }
    return { id: result.id ?? "" };
  },
  {
    response: {
      200: t.Object({
        id: t.String(),
      }),
      400: t.Object({
        message: t.String(),
      }),
      401: t.Object({
        message: t.String(),
      }),
      404: t.Object({
        message: t.String(),
      }),
      409: t.Object({
        message: t.String(),
      }),
      500: t.Object({
        message: t.String(),
      }),
    },
    body: t.Object({
      key: t.String(),
      domainName: t.String(),
      messageId: t.String(),
      providerMessageId: t.Optional(t.String()),
      fromEmail: t.String(),
      toEmails: t.Array(t.String()),
      subject: t.String(),
      textBody: t.Optional(t.String()),
      htmlBody: t.Optional(t.String()),
      rawMessage: t.Optional(t.String()),
      size: t.Number(),
    }),
    detail: {
      summary: "Log Incoming Email",
      description:
        "Log incoming SMTP email into the DB, returning the new email log ID.",
    },
  },
);
