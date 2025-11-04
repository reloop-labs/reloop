import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { getEventRoute } from "@reloop/webhook/routes/event/routes/get-event.route";
import { listEventsRoute } from "@reloop/webhook/routes/event/routes/list-events.route";
import { Elysia } from "elysia";

export const eventRoutes = new Elysia({
	prefix: "/events",
	name: "EventRoutes",
})
	.use(authMiddleware)
	.use(listEventsRoute)
	.use(getEventRoute);
