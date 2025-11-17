import { authMiddleware } from "@be/domain/middleware/auth";
import { DomainModel } from "@be/domain/model/domain.model";
import { verifyDNSRecordHandler } from "@be/domain/routes/domain/controllers/verify-dns-record";
import { Elysia } from "elysia";

export const verifyDNSRecordRoute = new Elysia().use(authMiddleware).post(
	"/verify",
	async ({ body, user }) => {
		const { domain } = body;
		const { activeOrganizationId } = user;
		return await verifyDNSRecordHandler({
			domain,
			organizationId: activeOrganizationId,
		});
	},
	{
		auth: true,
		body: DomainModel.createDomainBody,
		response: {
			200: DomainModel.domainResponse,
			400: DomainModel.invalidDomain,
			404: DomainModel.domainNotFound,
			500: DomainModel.invalidDomain,
			403: DomainModel.unauthorized,
		},
		detail: {
			tags: ["Verify-DNS-Record"],
			summary: "Verify DNS records",
			description:
				"Verifies DNS records for a domain to check if they are properly configured",
		},
	},
);
