import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { listSubscriptionsRoute } from "@reloop/webhook/routes/subscription/routes/list-subscriptions.route";
import { subscribeEventRoute } from "@reloop/webhook/routes/subscription/routes/subscribe-event.route";
import { unsubscribeEventRoute } from "@reloop/webhook/routes/subscription/routes/unsubscribe-event.route";
import { Elysia } from "elysia";

export const subscriptionRoutes = new Elysia({
	prefix: "/subscriptions",
	name: "SubscriptionRoutes",
})
	.use(authMiddleware)
	.use(subscribeEventRoute)
	.use(unsubscribeEventRoute)
	.use(listSubscriptionsRoute);
