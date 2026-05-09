import { authMiddleware } from "@be/domain/middleware/auth";
import { DomainModel } from "@be/domain/model/domain.model";
import { Elysia } from "elysia";
import { createDomainController } from "./create-domain.controllers";
import { createDomainXCodeSamples } from "./create-domain.x-codeSamples";

export const createDomainRoute = new Elysia().use(authMiddleware).post(
	"/create",
	async ({
		body,
		activeOrganizationId,
		userId,
		request: { headers },
		path,
		request,
	}) => {
		const cookie = headers.get("cookie") || undefined;
		return await createDomainController({
			organizationId: activeOrganizationId,
			domain: body.domain,
			customReturnPath: body.customReturnPath,
			clickTracking: body.clickTracking,
			openTracking: body.openTracking,
			tls: body.tls,
			sendingEmail: body.sendingEmail,
			receivingEmail: body.receivingEmail,
			userId,
			cookie,
			requestDetails: {
				endpoint: path,
				method: request.method,
				userAgent: headers.get("user-agent") || undefined,
				ipAddress:
					(headers.get("x-forwarded-for") as string) ||
					(headers.get("x-real-ip") as string),
			},
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
