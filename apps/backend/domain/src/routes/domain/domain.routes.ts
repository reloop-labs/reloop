import { createDomainRoute } from "@reloop/domain/routes/domain/create-domain/create-domain.route";
import { deleteDomainRoute } from "@reloop/domain/routes/domain/delete-domain/delete-domain.route";
import { getDomainRoute } from "@reloop/domain/routes/domain/get-domain/get-domain.route";
import { getDomainNameserversRoute } from "@reloop/domain/routes/domain/get-domain-nameserver/get-domain-dns.route";
import { listDomainsRoute } from "@reloop/domain/routes/domain/list-domains/list-domains.route";
import { updateDomainRoute } from "@reloop/domain/routes/domain/update-domain/update-domain.route";
import { verifyDNSRecordRoute } from "@reloop/domain/routes/domain/verify-dns/verify-dns.route";
import { kumomtaRoutes } from "@reloop/domain/routes/kumomta/kumomta.routes";
import { Elysia } from "elysia";

export const domainRoutes = new Elysia({ prefix: "/v1", name: "DomainRoutes" })
	.use(createDomainRoute)
	.use(getDomainNameserversRoute)
	.use(getDomainRoute)
	.use(updateDomainRoute)
	.use(deleteDomainRoute)
	.use(listDomainsRoute)
	.use(verifyDNSRecordRoute)
	.use(kumomtaRoutes);
