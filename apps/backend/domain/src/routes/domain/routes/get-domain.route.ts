import { authMiddleware } from "@be/domain/middleware/auth";
import { DomainModel } from "@be/domain/model/domain.model";
import { getDomainHandler } from "@be/domain/routes/domain/controllers/get-domain";
import { Elysia, t } from "elysia";

export const getDomainRoute = new Elysia().use(authMiddleware).get(
	"/:domain",
	async ({ params: { domain }, user }) => {
		return await getDomainHandler(domain, user.activeOrganizationId);
	},
	{
		auth: true,
		params: t.Object({
			domain: DomainModel.domainParam,
		}),
		response: {
			200: DomainModel.domainResponse,
			404: DomainModel.domainNotFound,
			400: DomainModel.invalidDomain,
			403: DomainModel.unauthorized,
		},
		detail: {
			tags: ["Domains"],
			summary: "Get domain by name",
			description: "Retrieves a domain by its domain name",
		},
	},
);
