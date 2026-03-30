import { authMiddleware } from "@be/domain/middleware/auth";
import { createDomainRoute } from "@be/domain/routes/domain/create-domain/create-domain.route";
import { deleteDomainRoute } from "@be/domain/routes/domain/delete-domain/delete-domain.route";
import { getDomainRoute } from "@be/domain/routes/domain/get-domain/get-domain.route";
import { listDomainsRoute } from "@be/domain/routes/domain/list-domains/list-domains.route";
import { updateDomainRoute } from "@be/domain/routes/domain/update-domain/update-domain.route";
import { verifyDNSRecordRoute } from "@be/domain/routes/domain/verify-dns/verify-dns.route";
import { Elysia } from "elysia";

export const domainRoutes = new Elysia({ prefix: "/v1", name: "DomainRoutes" })
	.use(authMiddleware)
	.use(createDomainRoute)
	.use(getDomainRoute)
	.use(updateDomainRoute)
	.use(deleteDomainRoute)
	.use(listDomainsRoute)
	.use(verifyDNSRecordRoute);
