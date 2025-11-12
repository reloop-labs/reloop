import { authMiddleware } from "@reloop/be-mail/middleware/auth";
import { sendEmailRoute } from "@reloop/be-mail/routes/mail/routes/send-email.route";
import { testSendRoute } from "@reloop/be-mail/routes/mail/routes/test-send.route";
import { Elysia } from "elysia";

export const mailRoutes = new Elysia({
	prefix: "/v1",
	name: "MailRoutes",
})
	.use(testSendRoute)
	.use(authMiddleware)
	.use(sendEmailRoute);
