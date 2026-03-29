import { Elysia } from "elysia";
import { listSubscriptionsRoute } from "./list-subscriptions/list-subscriptions.route";

export const subscriptionRoutes = new Elysia({
	prefix: "/v1/subscriptions",
	name: "SubscriptionRoutes",
})
	.use(listSubscriptionsRoute);
