import { authMiddleware } from "@reloop/domain/middleware/auth";
import { DomainModel } from "@reloop/domain/model/domain.model";
import { SmtpProviderModel } from "@reloop/domain/model/smtp-provider.model";
import { Elysia } from "elysia";
import { listSmtpProvidersController } from "./list-smtp-providers.controllers";

export const listSmtpProvidersRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/smtp-providers",
		async ({ organizationId }) => listSmtpProvidersController(organizationId),
		{
			auth: true,
			response: {
				200: SmtpProviderModel.listResponse,
				403: DomainModel.unauthorized,
			},
			detail: {
				tags: ["SMTP Providers"],
				summary: "List SMTP providers",
				description:
					"Returns the organization's bring-your-own SMTP relays. Passwords are never returned.",
			},
		},
	);
