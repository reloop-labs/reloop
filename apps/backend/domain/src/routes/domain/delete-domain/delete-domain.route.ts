import { authMiddleware } from "@reloop/domain/middleware/auth";
import { rateLimitPlugin } from "@reloop/domain/middleware/rate-limit";
import { DomainModel } from "@reloop/domain/model/domain.model";
import { auditLogHook } from "@reloop/domain/utils/audit-log";
import { Elysia, t } from "elysia";
import { deleteDomainController } from "./delete-domain.controllers";
import { deleteDomainXCodeSamples } from "./delete-domain.x-codeSamples";

export const deleteDomainRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 10, windowSeconds: 60, namespace: "delete" }))
	.delete(
		"/:domain_id",
		async ({ params: { domain_id }, organizationId }) => {
			return await deleteDomainController({
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
				200: DomainModel.domainResponse,
				404: DomainModel.domainNotFound,
				400: DomainModel.invalidDomain,
				403: DomainModel.unauthorized,
			},
			detail: {
				tags: ["Domains"],
				summary: "Delete Domain",
				description: "Deletes a domain and all its associated data",
				"x-codeSamples": deleteDomainXCodeSamples,
			},
			afterResponse: auditLogHook({ action: "deleted", successStatus: 200 }),
		},
	);
