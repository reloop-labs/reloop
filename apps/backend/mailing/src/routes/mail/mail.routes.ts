import { authMiddleware } from "@reloop/be-mailing/middleware/auth";
import { Elysia } from "elysia";
import { trackRoute } from "../track/track.route";
import { sendEmailRoute } from "./send-email/send-email.route";

export const mailRoutes = new Elysia({
	prefix: "/v1",
	name: "MailRoutes",
})
	.use(trackRoute)
	.use(authMiddleware)
	.use(sendEmailRoute)
