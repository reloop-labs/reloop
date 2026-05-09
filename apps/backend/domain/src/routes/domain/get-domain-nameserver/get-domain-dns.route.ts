import { authMiddleware } from "@be/domain/middleware/auth";
import { DNSModel } from "@be/domain/model/dns.model";
import { Elysia, t } from "elysia";
import { getDomainDNSController } from "./get-domain-nameserver.controllers";
import { getDomainNameserversXCodeSamples } from "./get-domain-nameserver.x-codeSamples";

export const getDomainNameserversRoute = new Elysia().use(authMiddleware).get(
	"/nameservers/:domain_id",
	async ({ params: { domain_id }, activeOrganizationId }) => {
		return await getDomainDNSController({
			domainId: domain_id,
			organizationId: activeOrganizationId,
		});
	},
	{
		cookieAuth: true,
		params: t.Object({
			domain_id: t.String(),
		}),
		response: {
			200: DNSModel.domainNameserversResponse,
			404: DNSModel.dnsRecordsNotFound,
			403: DNSModel.unauthorized,
		},
		detail: {
			tags: ["Domains"],
			summary: "Domain Nameservers",
			description: "Returns nameservers for a domain",
			"x-codeSamples": getDomainNameserversXCodeSamples,
		},
	},
);
