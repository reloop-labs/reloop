import { authMiddleware } from "@be/domain/middleware/auth";
import { verifyDNSRecordHandler } from "@be/domain/routes/dns/controllers/verify-dns-record";
import { DNSModel } from "@be/domain/routes/dns/dns.model";
import { Elysia, status } from "elysia";

export const verifyDNSRecordRoute = new Elysia().use(authMiddleware).post(
	"/:domain/verify",
	async ({ params: { domain }, body, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, { message: "User is not a member of an organization" });
		}
		return await verifyDNSRecordHandler(
			domain,
			body,
			user.activeOrganizationId,
		);
	},
	{
		auth: true,
		params: DNSModel.domainParams,
		body: DNSModel.verifyDNSBody,
		response: {
			200: DNSModel.verifyDNSResponse,
			404: DNSModel.dnsRecordNotFound,
		},
		detail: {
			tags: ["DNS"],
			summary: "Verify DNS record",
			description: "Verifies a DNS record for a domain",
		},
	},
);
