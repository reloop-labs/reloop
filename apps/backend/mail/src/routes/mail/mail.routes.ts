import { authMiddleware } from "@reloop/be-mail/middleware/auth";
import { Elysia } from "elysia";
import { getAttachmentRoute } from "./get-attachment/get-attachment.route";
import { listEmailLogsRoute } from "./list-email-logs/list-email-logs.route";

import { sendEmailRoute } from "./send-email/send-email.route";

export const mailRoutes = new Elysia({
	prefix: "/v1",
	name: "MailRoutes",
})
	.use(authMiddleware)
	.use(sendEmailRoute)
	.use(getAttachmentRoute)
	.use(listEmailLogsRoute);

