import { Elysia } from "elysia";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { createDomainRoute } from "@reloop/domain/routes/domain/routes/create-domain.route";
import { deleteDomainRoute } from "@reloop/domain/routes/domain/routes/delete-domain.route";
import { getDomainRoute } from "@reloop/domain/routes/domain/routes/get-domain.route";
import { listDomainsRoute } from "@reloop/domain/routes/domain/routes/list-domains.route";

export const domainRoutes = new Elysia({
    prefix: "/v1",
    name: "DomainRoutes",
})
    .use(authMiddleware)
    .use(createDomainRoute)
    .use(getDomainRoute)
    .use(deleteDomainRoute)
    .use(listDomainsRoute);
