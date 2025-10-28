import { authMiddleware } from "@reloop/be-mail/middleware/auth";
import { healthRoute } from "@reloop/be-mail/routes/mail/routes/health.route";
import { sendEmailRoute } from "@reloop/be-mail/routes/mail/routes/send-email.route";
import { Elysia } from "elysia";

export const mailRoutes = new Elysia({
    prefix: "/v1",
    name: "MailRoutes",
})
    .use(healthRoute)
    .use(authMiddleware)
    .use(sendEmailRoute);
