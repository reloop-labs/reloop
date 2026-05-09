import { authMiddleware } from "@be/domain/middleware/auth";
import { DomainModel } from "@be/domain/model/domain.model";
import { Elysia, t } from "elysia";
import { updateDomainController } from "./update-domain.controllers";
import { updateDomainXCodeSamples } from "./update-domain.x-codeSamples";

export const updateDomainRoute = new Elysia().use(authMiddleware).patch(
	"/:domain_id",
	async ({
		params: { domain_id },
		body,
		activeOrganizationId,
		request: { headers },
		path,
		request,
	}) => {
		const cookie = headers.get("cookie") || undefined;
		return await updateDomainController({
			domainId: domain_id,
			organizationId: activeOrganizationId,
			body,
			cookie,
			requestDetails: {
				endpoint: path,
				method: request.method,
				userAgent: headers.get("user-agent") || undefined,
				ipAddress:
					(headers.get("x-forwarded-for") || headers.get("x-real-ip")) ??
					undefined,
			},
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
