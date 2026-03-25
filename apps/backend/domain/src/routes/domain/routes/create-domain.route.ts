import { domainErrorResponse } from "@be/domain/error/domain.error-response";
import { authMiddleware } from "@be/domain/middleware/auth";
import { DomainModel } from "@be/domain/model/domain.model";
import { createDomainHandler } from "@be/domain/routes/domain/controllers/create-domain";
import { Elysia } from "elysia";

export const createDomainRoute = new Elysia().use(authMiddleware).post(
	"/add",
	async ({ body, user }) => {
		const { id: userId, activeOrganizationId: organizationId } = user;
		const { domain } = body;
		try {
			return await createDomainHandler({
				organizationId,
				domain,
				userId,
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			domainErrorResponse(errorMessage);
		}
	},
	{
		auth: true,
		body: DomainModel.createDomainBody,
		response: {
			201: DomainModel.domainResponse,
			409: DomainModel.domainAlreadyExists,
			400: DomainModel.invalidDomain,
			403: DomainModel.unauthorized,
		},
		detail: {
			tags: ["Domains"],
			summary: "Add a new domain",
			description: "Adds a new domain to the user's organization",
		},
	},
);
