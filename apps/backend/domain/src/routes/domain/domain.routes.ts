import { authMiddleware } from "@be/domain/middleware/auth";
import { createDomainRoute } from "@be/domain/routes/domain/routes/create-domain.route";
import { deleteDomainRoute } from "@be/domain/routes/domain/routes/delete-domain.route";
import { getDomainRoute } from "@be/domain/routes/domain/routes/get-domain.route";
import { listDomainsRoute } from "@be/domain/routes/domain/routes/list-domains.route";
import { Elysia } from "elysia";

export const domainRoutes = new Elysia({
	prefix: "/v1",
	name: "DomainRoutes",
})
	.use(authMiddleware)
	.use(createDomainRoute)
	.use(getDomainRoute)
	.use(deleteDomainRoute)
	.use(listDomainsRoute);
