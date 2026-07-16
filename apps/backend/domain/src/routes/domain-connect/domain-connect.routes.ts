import { applyUrlRoute } from "@reloop/domain/routes/domain-connect/apply-url/apply-url.route";
import { callbackRoute } from "@reloop/domain/routes/domain-connect/callback/callback.route";
import { discoverRoute } from "@reloop/domain/routes/domain-connect/discover/discover.route";
import { Elysia } from "elysia";

export const domainConnectRoutes = new Elysia({
	prefix: "/domain-connect",
	name: "DomainConnectRoutes",
})
	.use(discoverRoute)
	.use(applyUrlRoute)
	.use(callbackRoute);
