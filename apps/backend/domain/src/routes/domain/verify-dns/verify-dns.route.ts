import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { rateLimitPlugin } from "@reloop/domain/middleware/rate-limit";
import { DomainModel } from "@reloop/domain/model/domain.model";
import { auditLogHook } from "@reloop/domain/utils/audit-log";
import { Elysia, t } from "elysia";
import {
	forwardDNSController,
	verifyDNSRecordController,
} from "./verify-dns.controllers";
import { verifyDNSXCodeSamples } from "./verify-dns.x-codeSamples";

export const verifyDNSRecordRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 10, windowSeconds: 60, namespace: "verify" }))
	.post(
		"/verify/:domain_id",
		async ({ params: { domain_id }, organizationId }) => {
			return await verifyDNSRecordController({
				domainId: domain_id,
				organizationId,
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
			afterResponse: auditLogHook({ action: "verified", successStatus: 200 }),
		},
	)
	.post(
		"/verify/:domain_id/forward-dns",
		async ({ params: { domain_id }, body: { email }, organizationId }) => {
			return await forwardDNSController({
				domainId: domain_id,
				email,
				organizationId,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({
				domain_id: t.String(),
			}),
			body: t.Object({
				email: t.String({ format: "email" }),
			}),
			response: {
				200: t.Object({
					success: t.Boolean(),
				}),
				400: ErrorResponseSchema,
				404: ErrorResponseSchema,
				403: ErrorResponseSchema,
			},
			detail: {
				tags: ["Domains"],
				summary: "Forward DNS Records",
				description:
					"Forwards DNS configuration records of a domain to an email address",
			},
		},
	);
