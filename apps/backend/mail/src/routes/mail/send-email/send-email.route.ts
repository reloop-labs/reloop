import { mailConfig } from "@reloop/be-mail/mail.config";
import { authMiddleware } from "@reloop/be-mail/middleware/auth";
import { checkRateLimit } from "@reloop/be-mail/middleware/rate-limiter";
import { MailModel } from "@reloop/be-mail/model/mail.model.js";
import { auditLogHook } from "@reloop/be-mail/utils/audit-log";
import { sendEmailXCodeSamples } from "@reloop/code-samples/mail";
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
				// Apply ratelimit-* / x-reloop-* headers even on 429
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
			// External API key path uses the caller's key for KumoMTA.
			// Session/internal auth uses the shared internal secret so inject
			// can authenticate without a recoverable plaintext org API key.
			const useInternalInject = authType !== "apikey";
			const injectApiKey = useInternalInject
				? mailConfig.RELOOP_INTERNAL_SECRET
				: (requestApiKey ?? "");

			return await sendEmailController({
				organizationId,
				body,
				apiKey: injectApiKey,
				apiKeyId,
				userId,
				useInternalInject,
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
				402: MailModel.paymentRequired,
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
				tags: ["Mail"],
				"x-codeSamples": sendEmailXCodeSamples,
			},
		},
	);
