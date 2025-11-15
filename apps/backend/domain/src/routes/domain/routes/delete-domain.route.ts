import { authMiddleware } from "@be/domain/middleware/auth";
import { DomainModel } from "@be/domain/model/domain.model";
import { deleteDomainHandler } from "@be/domain/routes/domain/controllers/delete-domain";
import { Elysia, t } from "elysia";

export const deleteDomainRoute = new Elysia().use(authMiddleware).delete(
	"/:domain",
	async ({ params: { domain }, user }) => {
		return await deleteDomainHandler(domain, user.activeOrganizationId);
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
			summary: "Delete domain",
			description: "Deletes a domain and all its associated data",
		},
	},
);
