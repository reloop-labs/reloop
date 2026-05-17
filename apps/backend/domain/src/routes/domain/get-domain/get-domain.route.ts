import { authMiddleware } from "@reloop/domain/middleware/auth";
import { DomainModel } from "@reloop/domain/model/domain.model";
import { Elysia, t } from "elysia";
import { getDomainController } from "./get-domain.controllers";
import { getDomainXCodeSamples } from "./get-domain.x-codeSamples";

export const getDomainRoute = new Elysia().use(authMiddleware).get(
	"/:domain_id",
	async ({ params: { domain_id }, organizationId }) => {
		return await getDomainController({
			domainId: domain_id,
			organizationId: organizationId,
		});
	},
	{
		auth: true,
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
			summary: "Retrieve Domain",
			description: "Retrieves a domain by its ID",
			"x-codeSamples": getDomainXCodeSamples,
		},
	},
);
