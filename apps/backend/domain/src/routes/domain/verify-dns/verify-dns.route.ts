import { authMiddleware } from "@reloop/domain/middleware/auth";
import { rateLimitPlugin } from "@reloop/domain/middleware/rate-limit";
import { DomainModel } from "@reloop/domain/model/domain.model";
import { Elysia, t } from "elysia";
import { verifyDNSRecordController } from "./verify-dns.controllers";
import { verifyDNSXCodeSamples } from "./verify-dns.x-codeSamples";

export const verifyDNSRecordRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 10, windowSeconds: 60, namespace: "verify" }))
	.post(
	"/verify/:domain_id",
	async ({ params: { domain_id }, organizationId }) => {
		return await verifyDNSRecordController({
			domainId: domain_id,
			organizationId: organizationId,
		});
	},
	{
		auth: true,
		rateLimit: true,
		params: t.Object({
			domain_id: t.String(),
		}),
		response: {
			200: DomainModel.domainStatusResponse,
			400: DomainModel.invalidDomain,
			404: DomainModel.domainNotFound,
			500: DomainModel.invalidDomain,
			403: DomainModel.unauthorized,
		},
		detail: {
			tags: ["Domains"],
			summary: "Verify Domain",
			description:
				"Verifies DNS records for a domain to check if they are properly configured",
			"x-codeSamples": verifyDNSXCodeSamples,
		},
	},
);
