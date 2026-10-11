import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { rateLimitPlugin } from "@reloop/domain/middleware/rate-limit";
import { SmtpProviderModel } from "@reloop/domain/model/smtp-provider.model";
import { Elysia } from "elysia";
import { createSmtpProviderController } from "./create-smtp-provider.controllers";

export const createSmtpProviderRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({ max: 10, windowSeconds: 60, namespace: "smtp-create" }),
	)
	.post(
		"/smtp-providers",
		async ({ body, organizationId, userId, set }) => {
			set.status = 201;
			return createSmtpProviderController({ organizationId, userId, body });
		},
		{
			auth: true,
			rateLimit: true,
			body: SmtpProviderModel.createBody,
			response: {
				201: SmtpProviderModel.provider,
				400: ErrorResponseSchema,
				402: ErrorResponseSchema,
			},
			detail: {
				tags: ["SMTP Providers"],
				summary: "Create SMTP provider",
				description:
					"Stores a bring-your-own SMTP relay and sets up `domain` to send through it in one step: the domain is created (or reused) automatically, needs no Reloop DNS records, and the connection is tested immediately.",
			},
		},
	);
