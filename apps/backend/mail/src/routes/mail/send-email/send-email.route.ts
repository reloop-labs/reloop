import { authMiddleware } from "@reloop/be-mail/middleware/auth";
import { checkRateLimit } from "@reloop/be-mail/middleware/rate-limiter";
import { MailModel } from "@reloop/be-mail/model/mail.model.js";
import { auditLogHook } from "@reloop/be-mail/utils/audit-log";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { sendEmailController } from "./send-email.controllers";

export const sendEmailRoute = new Elysia()
	.use(evlog())
	.use(authMiddleware)
	.post(
		"/send",
		async ({
			body,
			activeOrganizationId,
			userId,
			apikeyId,
			request,
			set,
			log,
		}) => {
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
				apiKey: request.headers.get("x-api-key") ?? "",
				apikeyId,
				userId,
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
			afterResponse: auditLogHook({
				resourceType: "email",
				action: "sent",
			}),
			detail: {
				summary: "Send email",
				description: "Send an email through the KumoMTA mail server",
			},
		},
	);
