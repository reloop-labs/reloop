import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { SmtpProviderModel } from "@reloop/domain/model/smtp-provider.model";
import { Elysia } from "elysia";
import { deleteSmtpProviderController } from "./delete-smtp-provider.controllers";

export const deleteSmtpProviderRoute = new Elysia()
	.use(authMiddleware)
	.delete(
		"/smtp-providers/:provider_id",
		async ({ params: { provider_id }, organizationId }) =>
			deleteSmtpProviderController({ organizationId, providerId: provider_id }),
		{
			auth: true,
			params: SmtpProviderModel.params,
			response: {
				200: SmtpProviderModel.deleteResponse,
				404: ErrorResponseSchema,
			},
			detail: {
				tags: ["SMTP Providers"],
				summary: "Delete SMTP provider",
				description:
					"Deletes a relay. Domains created only for it are removed; domains with Reloop DNS go back to sending through Reloop.",
			},
		},
	);
