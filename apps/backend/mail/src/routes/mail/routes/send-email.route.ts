import { formatSendEmailResponse } from "@reloop/be-mail/routes/mail/controllers/format-mail-response";
import { sendEmail } from "@reloop/be-mail/routes/mail/controllers/send-email";
import {
    sendEmailBodySchema,
    sendEmailResponseSchema,
} from "@reloop/be-mail/routes/mail/mail.type";
import { t } from "elysia";

export const sendEmailRoute = new Elysia().post(
    "/send",
    async ({ body, auth, set }) => {
        try {
            if (!auth.user) {
                set.status = 401;
                return { error: "Authentication required" };
            }

            // For now, we'll use a default organization ID
            // In a real implementation, this would come from the authenticated user
            const organizationId = "default-org-id"; // TODO: Get from auth context

            const result = await sendEmail(body, auth.user.id, organizationId);
            return formatSendEmailResponse(result);
        } catch (error) {
            set.status = 500;
            return {
                error: error instanceof Error ? error.message : "Failed to send email",
            };
        }
    },
    {
        body: sendEmailBodySchema,
        response: {
            200: sendEmailResponseSchema,
            401: t.Object({
                error: t.String(),
            }),
            500: t.Object({
                error: t.String(),
            }),
        },
        detail: {
            tags: ["Mail"],
            summary: "Send email",
            description: "Send an email through the Postfix mail server",
        },
    },
);
