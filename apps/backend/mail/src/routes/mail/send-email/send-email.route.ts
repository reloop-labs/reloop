import { authMiddleware } from "@reloop/be-mail/middleware/auth";
import { MailModel } from "@reloop/be-mail/model/mail.model.js";
import type { MailTypes } from "@reloop/be-mail/types/mail.type.js";
import { type Logger, logger } from "@reloop/logger";
import { Elysia, status } from "elysia";
import { sendEmailController } from "./send-email.controllers";

export const sendEmailRoute = new Elysia().use(authMiddleware).post(
  "/send",
  async ({ body, activeOrganizationId, logger: contextLogger }) => {
    if (!activeOrganizationId) {
      throw status(403, {
        message: "User is not a member of an organization",
      });
    }

    return await sendEmailController({
      organizationId: activeOrganizationId,
      body: body as MailTypes.SendEmailRequest,
      logger: (contextLogger as Logger) || logger,
    });
  },
  {
    auth: true,
    body: MailModel.sendEmailBody,
    response: {
      200: MailModel.sendEmailResponse,
      401: MailModel.unauthorized,
      403: MailModel.forbidden,
      400: MailModel.badRequest,
      500: MailModel.internalServerError,
    },
    detail: {
      tags: ["Mail"],
      summary: "Send email",
      description: "Send an email through the KumoMTA mail server",
    },
  },
);
