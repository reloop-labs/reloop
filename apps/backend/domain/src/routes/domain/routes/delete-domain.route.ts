import { authMiddleware } from "@reloop/domain/middleware/auth";
import { deleteDomainHandler } from "@reloop/domain/routes/domain/controllers/delete-domain";
import { DomainModel } from "@reloop/domain/routes/domain/domain.model";
import { Elysia, status, t } from "elysia";

export const deleteDomainRoute = new Elysia().use(authMiddleware).delete(
	"/:domain",
	async ({ params: { domain }, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await deleteDomainHandler(domain, user.activeOrganizationId);
	},
	{
		auth: true,
		params: t.Object({
			domain: DomainModel.domainParam,
		}),
		response: {
			200: t.Object({ message: t.String() }),
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
