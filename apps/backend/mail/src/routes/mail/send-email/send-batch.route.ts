import { extractApiKey } from "@reloop/auth/middleware";
import { parseBatchValidationMode } from "@reloop/be-mail/lib/batch";
import { mailConfig } from "@reloop/be-mail/mail.config";
import { authMiddleware } from "@reloop/be-mail/middleware/auth";
import { checkRateLimit } from "@reloop/be-mail/middleware/rate-limiter";
import { MailModel } from "@reloop/be-mail/model/mail.model.js";
import { auditLogHook } from "@reloop/be-mail/utils/audit-log";
import { sendBatchXCodeSamples } from "@reloop/code-samples/mail";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { sendBatchController } from "./send-batch.controllers";

export const sendBatchRoute = new Elysia()
	.use(evlog())
	.use(authMiddleware)
	.post(
		"/send/batch",
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
			// Volume layers charge one unit per email in the batch.
			try {
				const rateLimitHeaders = await checkRateLimit({
					headers: request.headers,
					activeOrganizationId: organizationId,
					userId,
					authType,
					cost: body.length,
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

			const requestApiKey = extractApiKey(request.headers);
			const useInternalInject = authType !== "apikey";

			return await sendBatchController({
				emails: body,
				mode: parseBatchValidationMode(
					request.headers.get("x-batch-validation"),
				),
				idempotencyKey: request.headers.get("idempotency-key"),
				ctx: {
					organizationId,
					apiKey: useInternalInject
						? mailConfig.RELOOP_INTERNAL_SECRET
						: (requestApiKey ?? ""),
					apiKeyId,
					userId,
					cookie: request.headers.get("cookie"),
					requestApiKey,
					useInternalInject,
				},
			});
		},
		{
			auth: true,
			body: MailModel.sendBatchBody,
			response: {
				200: MailModel.sendBatchResponse,
				401: MailModel.unauthorized,
				403: MailModel.forbidden,
				400: MailModel.badRequest,
				402: MailModel.paymentRequired,
				503: MailModel.badRequest,
				429: MailModel.tooManyRequests,
				500: MailModel.internalServerError,
				413: MailModel.badRequest,
			},
			afterResponse: auditLogHook({
				resourceType: "email",
				action: "batch_sent",
			}),
			detail: {
				summary: "Send batch emails",
				description:
					"Send up to 100 emails in one request. Each email takes the same fields as Send email and goes through the same checks, tracking and billing; recipients are not stored as contacts. " +
					"Every email is validated before any is sent. With the default `x-batch-validation: strict`, one invalid email rejects the whole batch (the error names its index). " +
					"With `x-batch-validation: permissive`, invalid emails are skipped and listed in `errors` while the rest send. " +
					"An `Idempotency-Key` header applies per email as `<key>:<index>`, so a retried batch never sends an email twice. " +
					"`data` lists accepted emails with their request `index`; if none were accepted the request fails with the first email's error.",
				tags: ["Mail"],
				parameters: [
					{
						name: "x-batch-validation",
						in: "header",
						required: false,
						description:
							"`strict` (default): reject the whole batch if any email is invalid. `permissive`: send the valid emails and report the rest in `errors`.",
						schema: { type: "string", enum: ["strict", "permissive"] },
					},
					{
						name: "Idempotency-Key",
						in: "header",
						required: false,
						description:
							"Applied per email as `<key>:<index>`. Retrying the same batch with the same key returns the original sends.",
						schema: { type: "string", maxLength: 256 },
					},
				],
				"x-codeSamples": sendBatchXCodeSamples,
			},
		},
	);
