import { ErrorResponseSchema } from "@reloop/domain/error/domain.error-response";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { rateLimitPlugin } from "@reloop/domain/middleware/rate-limit";
import { SmtpProviderModel } from "@reloop/domain/model/smtp-provider.model";
import { Elysia } from "elysia";
import { sendTestEmailController } from "./send-test-email.controllers";

export const sendTestEmailRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({ max: 5, windowSeconds: 60, namespace: "smtp-test-send" }),
	)
	.post(
		"/smtp-providers/test-send",
		async ({ body }) => sendTestEmailController(body),
		{
			auth: true,
			rateLimit: true,
			body: SmtpProviderModel.sendTestBody,
			response: {
				200: SmtpProviderModel.sendTestResponse,
				400: ErrorResponseSchema,
			},
			detail: {
				tags: ["SMTP Providers"],
				summary: "Send a test email",
				description:
					"Sends a real test email through SMTP credentials without saving them, so you can confirm the server accepts your login and From address. `ok: false` carries the server's error.",
			},
		},
	);
