import { authMiddleware } from "@be/domain/middleware/auth";
import { DomainModel } from "@be/domain/model/domain.model";
import { Elysia, t } from "elysia";
import { updateDomainController } from "./update-domain.controllers";
import { updateDomainXCodeSamples } from "./update-domain.x-codeSamples";

export const updateDomainRoute = new Elysia()
	.use(authMiddleware)
	.patch(
		"/:domain_id",
		async ({ params: { domain_id }, body, activeOrganizationId, logger }) => {
			return await updateDomainController({
				domainId: domain_id,
				organizationId: activeOrganizationId,
				body,
				logger,
			});
		},
		{
			auth: true,
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
		},
	);
