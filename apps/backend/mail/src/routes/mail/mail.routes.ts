import { Elysia } from "elysia";
import { trackRoute } from "../track/track.route";
import { resendEmailRoute } from "./send-email/resend-email.route";
import { sendEmailRoute } from "./send-email/send-email.route";

export const mailRoutes = new Elysia({
	prefix: "/v1",
	name: "MailRoutes",
})
	.use(trackRoute)
	.use(sendEmailRoute)
	.use(resendEmailRoute);

