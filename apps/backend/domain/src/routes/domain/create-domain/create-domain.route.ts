import { authMiddleware } from "@reloop/domain/middleware/auth";
import { DomainModel } from "@reloop/domain/model/domain.model";
import { Elysia } from "elysia";
import { createDomainController } from "./create-domain.controllers";
import { createDomainXCodeSamples } from "./create-domain.x-codeSamples";

export const createDomainRoute = new Elysia().use(authMiddleware).post(
	"/create",
	async ({ body, organizationId, userId }) => {
		return await createDomainController({
			organizationId: organizationId,
			domain: body.domain,
			custom_return_path: body.custom_return_path,
			tracking: body.tracking,
			click_tracking: body.click_tracking,
			open_tracking: body.open_tracking,
			tls: body.tls,
			sending_email: body.sending_email,
			receiving_email: body.receiving_email,
			userId,
		});
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
			summary: "Create Domain",
			description: "Creates a new domain",
			"x-codeSamples": createDomainXCodeSamples,
		},
	},
);
