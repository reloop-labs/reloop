import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { rateLimitPlugin } from "@reloop/domain/middleware/rate-limit";
import { SmtpProviderModel } from "@reloop/domain/model/smtp-provider.model";
import { Elysia } from "elysia";
import { testSmtpProviderController } from "./test-smtp-provider.controllers";

export const testSmtpProviderRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 5, windowSeconds: 60, namespace: "smtp-test" }))
	.post(
		"/smtp-providers/:provider_id/test",
		async ({ params: { provider_id }, organizationId }) =>
			testSmtpProviderController({ organizationId, providerId: provider_id }),
		{
			auth: true,
			rateLimit: true,
			params: SmtpProviderModel.params,
			response: {
				200: SmtpProviderModel.testResponse,
				400: ErrorResponseSchema,
				404: ErrorResponseSchema,
			},
			detail: {
				tags: ["SMTP Providers"],
				summary: "Test SMTP provider",
				description:
					"Connects to the relay, negotiates STARTTLS and authenticates. No mail is sent.",
			},
		},
	);
