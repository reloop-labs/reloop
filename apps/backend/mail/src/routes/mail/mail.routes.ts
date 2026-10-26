import { Elysia } from "elysia";
import { trackRoute } from "../track/track.route";
import { adminResendEmailRoute } from "./send-email/admin-resend-email.route";
import { resendEmailRoute } from "./send-email/resend-email.route";
import { sendBatchRoute } from "./send-email/send-batch.route";
import { sendEmailRoute } from "./send-email/send-email.route";

export const mailRoutes = new Elysia({
	prefix: "/v1",
	name: "MailRoutes",
})
	.use(trackRoute)
	.use(sendEmailRoute)
	.use(sendBatchRoute)
	.use(resendEmailRoute)
	.use(adminResendEmailRoute);
