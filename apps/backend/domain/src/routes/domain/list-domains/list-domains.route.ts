import { listDomainsXCodeSamples } from "@reloop/code-samples/domain";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { DomainModel } from "@reloop/domain/model/domain.model";
import { Elysia } from "elysia";
import { listDomainsController } from "./list-domains.controllers";

export const listDomainsRoute = new Elysia().use(authMiddleware).get(
	"/list",
	async ({ query, organizationId }) => {
		return await listDomainsController({
			query,
			organizationId,
		});
	},
	{
		query: DomainModel.domainQuery,
		response: {
			200: DomainModel.domainListResponse,
			403: DomainModel.unauthorized,
		},
		auth: true,
		detail: {
			tags: ["Domains"],
			summary: "List domains",
			description:
				"Retrieves a paginated list of domains with optional filters",
			"x-codeSamples": listDomainsXCodeSamples,
		},
	},
);
