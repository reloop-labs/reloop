import { Elysia } from "elysia";
import { authMiddleware } from "../../middleware/auth";
import { createDomainRoute } from "./routes/create-domain.route";
import { deleteDomainRoute } from "./routes/delete-domain.route";
import { getDomainRoute } from "./routes/get-domain.route";
import { listDomainsRoute } from "./routes/list-domains.route";

export const domainRoutes = new Elysia({
    prefix: "/v1",
    name: "DomainRoutes",
})
    .use(authMiddleware)
    .use(createDomainRoute)
    .use(getDomainRoute)
    .use(deleteDomainRoute)
    .use(listDomainsRoute);
