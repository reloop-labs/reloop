import { deleteDomainXCodeSamples } from "@reloop/code-samples/domain";
import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { rateLimitPlugin } from "@reloop/domain/middleware/rate-limit";
import { DomainModel } from "@reloop/domain/model/domain.model";
import { auditLogHook } from "@reloop/domain/utils/audit-log";
import { Elysia, t } from "elysia";
import { deleteDomainController } from "./delete-domain.controllers";

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
				400: ErrorResponseSchema,
				403: ErrorResponseSchema,
				404: ErrorResponseSchema,
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
