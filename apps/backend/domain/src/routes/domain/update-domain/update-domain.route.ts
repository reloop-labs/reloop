import { updateDomainXCodeSamples } from "@reloop/code-samples/domain";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { rateLimitPlugin } from "@reloop/domain/middleware/rate-limit";
import { DomainModel } from "@reloop/domain/model/domain.model";
import { auditLogHook } from "@reloop/domain/utils/audit-log";
import { Elysia, t } from "elysia";
import { updateDomainController } from "./update-domain.controllers";

export const updateDomainRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 10, windowSeconds: 60, namespace: "update" }))
	.patch(
		"/:domain_id",
		async ({ params: { domain_id }, body, organizationId }) => {
			return await updateDomainController({
				domainId: domain_id,
				organizationId,
				body,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({
				domain_id: t.String(),
			}),
			body: DomainModel.updateDomainBody,
			response: {
				200: DomainModel.domainResponse,
				404: DomainModel.domainNotFound,
				403: DomainModel.unauthorized,
			},
			detail: {
				tags: ["Domains"],
				summary: "Update domain",
				description: "Updates a domain",
				"x-codeSamples": updateDomainXCodeSamples,
			},
			afterResponse: auditLogHook({ action: "updated", successStatus: 200 }),
		},
	);
