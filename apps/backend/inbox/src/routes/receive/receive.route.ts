import { Elysia } from "elysia";
import { receiveInboundEmailController } from "./receive.controllers";
import { evlog } from "evlog/elysia";

export const receiveRoute = new Elysia({ prefix: "/v1" })
	.use(evlog())
	.post(
		"/receive",
		async ({ body }) => {
			return receiveInboundEmailController(body as string);
		},
		{
			// KumoMTA will send raw RFC822 message as text
			type: "text",
		}
	);
