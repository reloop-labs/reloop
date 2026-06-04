import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { evlog } from "evlog/elysia";
import { receiveInboundEmailController } from "./receive.controllers";

export const receiveRoute = new Elysia({ prefix: "/v1", name: "ReceiveInboundRoute" })
	.use(evlog())
	.post(
		"/receive",
		async ({ body }) => {
			return receiveInboundEmailController(body as string);
		},
		{
			// KumoMTA sends raw RFC822 message as text/plain
			parse: "text",
			response: {
				200: t.Object({
					success: t.Boolean(),
					id: t.String(),
					threadId: t.String(),
				}),
				400: t.String(),
				404: t.String(),
				500: t.String(),
			},
			detail: {
				tags: ["Inbound"],
				summary: "Receive Inbound SMTP Email",
				description: "Handles raw RFC822 incoming emails pushed by KumoMTA smtp server",
			},
		},
	);
