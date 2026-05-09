import { authMiddleware } from "@reloop/be-mailing/middleware/auth";
import { checkRateLimit } from "@reloop/be-mailing/middleware/rate-limiter";
import { MailModel } from "@reloop/be-mailing/model/mail.model.js";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { sendEmailController } from "./send-email.controllers";

export const sendEmailRoute = new Elysia()
	.use(evlog())
	.use(authMiddleware)
	.post(
		"/send",
		async ({ body, activeOrganizationId, userId, request, set, log }) => {
			// Rate limit check — runs after auth so we have org/user IDs
			const rateLimitHeaders = await checkRateLimit({
				headers: request.headers,
				activeOrganizationId,
				userId,
				log,
			});

			// Apply rate limit headers to the response
			for (const [key, value] of Object.entries(rateLimitHeaders)) {
				set.headers[key] = value;
			}

			return await sendEmailController({
				organizationId: activeOrganizationId,
				body,
			});
		},
		{
			auth: true,
			body: MailModel.sendEmailBody,
			response: {
				200: MailModel.sendEmailResponse,
				401: MailModel.unauthorized,
				403: MailModel.forbidden,
				400: MailModel.badRequest,
				429: MailModel.tooManyRequests,
				500: MailModel.internalServerError,
			},
			detail: {
				summary: "Send email",
				description: "Send an email through the KumoMTA mail server",
			},
		},
	);
