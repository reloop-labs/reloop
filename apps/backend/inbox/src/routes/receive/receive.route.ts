import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { receiveInboundEmailController } from "./receive.controllers";

export const receiveRoute = new Elysia({ prefix: "/v1" }).use(evlog()).post(
	"/receive",
	async ({ body }) => {
		return receiveInboundEmailController(body as string);
	},
	{
		// KumoMTA sends raw RFC822 message as text/plain
		parse: "text",
	},
);
