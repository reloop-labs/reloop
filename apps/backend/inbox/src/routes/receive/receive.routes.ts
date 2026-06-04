import { Elysia } from "elysia";
import { receiveInboundEmailRoute } from "./receive-inbound-email/receive-inbound-email.route";

export const receiveRoutes = new Elysia({
	prefix: "/v1",
	name: "ReceiveRoutes",
}).use(receiveInboundEmailRoute);
