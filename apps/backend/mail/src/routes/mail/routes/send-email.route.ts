import { authMiddleware } from "@reloop/be-mail/middleware/auth";
import { sendEmailHandler } from "@reloop/be-mail/routes/mail/controllers/send-email.js";
import { MailModel } from "@reloop/be-mail/routes/mail/mail.model.js";
import { Elysia, status } from "elysia";

export const sendEmailRoute = new Elysia().use(authMiddleware).post(
    "/send",
    async ({ body, user }) => {
        if (!user.activeOrganizationId) {
            throw status(403, {
                message: "User is not a member of an organization",
            });
        }
        return await sendEmailHandler(user.activeOrganizationId, user.id, body);
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
            description: "Send an email through the Postfix mail server",
        },
    },
);
