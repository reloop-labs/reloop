import { Elysia } from "elysia";
import { trackRoute } from "../track/track.route";
import { platformTestRoute } from "./platform-test/platform-test.route";
import { sendEmailRoute } from "./send-email/send-email.route";

export const mailRoutes = new Elysia({
	prefix: "/v1",
	name: "MailRoutes",
})
	.use(trackRoute)
	.use(sendEmailRoute)
	.use(platformTestRoute);
