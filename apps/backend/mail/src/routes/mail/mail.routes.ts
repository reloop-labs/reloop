import { authMiddleware } from "@reloop/be-mail/middleware/auth";
import { Elysia } from "elysia";
import { kumomtaConfigRoute } from "./kumomta-config/kumomta-config.route";
import { kumomtaWebhookRoute } from "./kumomta-webhook/kumomta-webhook.route";
import { sendEmailRoute } from "./send-email/send-email.route";
import { testSendRoute } from "./test-send/test-send.route";

export const mailRoutes = new Elysia({
	prefix: "/v1",
	name: "MailRoutes",
})
	.use(testSendRoute)
	.use(kumomtaWebhookRoute)
	.use(kumomtaConfigRoute)
	.use(authMiddleware)
	.use(sendEmailRoute);

