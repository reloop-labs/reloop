import { authMiddleware } from "@reloop/be-mail/middleware/auth";
import { Elysia } from "elysia";
import { getAttachmentRoute } from "./get-attachment/get-attachment.route";
import { kumomtaConfigRoute } from "./kumomta-config/kumomta-config.route";
import { kumomtaWebhookRoute } from "./kumomta-webhook/kumomta-webhook.route";
import { sendEmailRoute } from "./send-email/send-email.route";

export const mailRoutes = new Elysia({
	prefix: "/v1",
	name: "MailRoutes",
})
	.use(kumomtaWebhookRoute)
	.use(kumomtaConfigRoute)
	.use(authMiddleware)
	.use(sendEmailRoute)
	.use(getAttachmentRoute);

