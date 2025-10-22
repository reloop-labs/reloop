import { authMiddleware } from "@reloop/domain/middleware/auth";
import { generateDNSRecordsHandler } from "@reloop/domain/routes/dns/controllers/generate-dns-records";
import { DNSModel } from "@reloop/domain/routes/dns/dns.model";
import { Elysia, status } from "elysia";

export const generateDNSRecordsRoute = new Elysia().use(authMiddleware).post(
	"/:domain/generate",
	async ({ params: { domain }, body, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, { message: "User is not a member of an organization" });
		}
		return await generateDNSRecordsHandler(
			domain,
			user.activeOrganizationId,
			user.id,
			body,
		);
	},
	{
		auth: true,
		params: DNSModel.domainParams,
		body: DNSModel.generateDNSBody,
		response: {
			200: DNSModel.generateDNSResponse,
			403: DNSModel.unauthorized,
		},
		detail: {
			tags: ["DNS"],
			summary: "Generate DNS records for domain",
			description:
				"Generates and inserts DNS records and DKIM keys for a domain",
		},
	},
);
