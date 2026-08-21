import { mailConfig } from "@reloop/be-mail/mail.config";
import { authMiddleware } from "@reloop/be-mail/middleware/auth";
import { checkRateLimit } from "@reloop/be-mail/middleware/rate-limiter";
import { MailModel } from "@reloop/be-mail/model/mail.model.js";
import { auditLogHook } from "@reloop/be-mail/utils/audit-log";
import { Elysia, t } from "elysia";
import { evlog } from "evlog/elysia";
import { resendEmailController } from "./resend-email.controllers";

export const resendEmailRoute = new Elysia()
	.use(evlog())
	.use(authMiddleware)
	.post(
		"/resend/:id",
		async ({
			params: { id },
			organizationId,
			userId,
			authType,
			apiKeyId,
			request,
			set,
			log,
		}) => {
			// Rate limit check — runs after auth so we have org/user IDs
			try {
				const rateLimitHeaders = await checkRateLimit({
					headers: request.headers,
					activeOrganizationId: organizationId,
					userId,
					log,
				});
				for (const [key, value] of Object.entries(rateLimitHeaders)) {
					set.headers[key] = value;
				}
			} catch (error) {
				const headers = (error as { rateLimitHeaders?: Record<string, string> })
					.rateLimitHeaders;
				if (headers) {
					for (const [key, value] of Object.entries(headers)) {
						set.headers[key] = value;
					}
				}
				throw error;
			}

			const requestApiKey = request.headers.get("x-api-key");
			const useInternalInject = authType !== "apikey";
			const injectApiKey = useInternalInject
				? mailConfig.RELOOP_INTERNAL_SECRET
				: (requestApiKey ?? "");

			return await resendEmailController({
				emailId: id,
				organizationId,
				apiKey: injectApiKey,
				apiKeyId,
				userId,
				useInternalInject,
			});
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({
					minLength: 1,
					description: "Email log ID to resend",
				}),
			}),
			response: {
				200: MailModel.sendEmailResponse,
				401: MailModel.unauthorized,
				403: MailModel.forbidden,
				404: t.Object({
					message: t.String(),
					why: t.Optional(t.String()),
					fix: t.Optional(t.String()),
				}),
				400: MailModel.badRequest,
				402: MailModel.paymentRequired,
				429: MailModel.tooManyRequests,
				500: MailModel.internalServerError,
			},
			afterResponse: auditLogHook({
				resourceType: "email",
				action: "sent",
			}),
			detail: {
				summary: "Resend email",
				description: "Resend a previously sent or failed email by its log ID",
				tags: ["Mail"],
			},
		},
	);
