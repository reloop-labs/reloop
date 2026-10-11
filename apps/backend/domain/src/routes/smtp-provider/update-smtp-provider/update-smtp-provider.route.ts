import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { rateLimitPlugin } from "@reloop/domain/middleware/rate-limit";
import { SmtpProviderModel } from "@reloop/domain/model/smtp-provider.model";
import { Elysia } from "elysia";
import { updateSmtpProviderController } from "./update-smtp-provider.controllers";

export const updateSmtpProviderRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({ max: 20, windowSeconds: 60, namespace: "smtp-update" }),
	)
	.patch(
		"/smtp-providers/:provider_id",
		async ({ params: { provider_id }, body, organizationId, userId }) =>
			updateSmtpProviderController({
				organizationId,
				userId,
				providerId: provider_id,
				body,
			}),
		{
			auth: true,
			rateLimit: true,
			params: SmtpProviderModel.params,
			body: SmtpProviderModel.updateBody,
			response: {
				200: SmtpProviderModel.provider,
				400: ErrorResponseSchema,
				404: ErrorResponseSchema,
			},
			detail: {
				tags: ["SMTP Providers"],
				summary: "Update SMTP provider",
				description:
					"Updates a relay. Omit `password` to keep the stored one. Connection changes reset status to unverified.",
			},
		},
	);
