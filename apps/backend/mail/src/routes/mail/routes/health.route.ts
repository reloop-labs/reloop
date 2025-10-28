import { postfixClient } from "@reloop/be-mail/lib/postfix-client";
import { formatHealthResponse } from "@reloop/be-mail/routes/mail/controllers/format-mail-response";
import { healthResponseSchema } from "@reloop/be-mail/routes/mail/mail.type";

export const healthRoute = new Elysia()
    .get(
        "/health",
        async () => {
            const config = postfixClient.getConfig();
            const smtpConnected = await postfixClient.testConnection();

            return formatHealthResponse(
                smtpConnected ? "healthy" : "unhealthy",
                smtpConnected,
                config.host,
                config.port,
            );
        },
        {
            response: {
                200: healthResponseSchema,
            },
            detail: {
                tags: ["Health"],
                summary: "Health check",
                description: "Check the health of the mail service and SMTP connection",
            },
        },
    );
