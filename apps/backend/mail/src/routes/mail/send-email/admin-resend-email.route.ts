import { mailConfig } from "@reloop/be-mail/mail.config";
import { authMiddleware } from "@reloop/be-mail/middleware/auth";
import { MailModel } from "@reloop/be-mail/model/mail.model.js";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { createError } from "evlog";
import { evlog } from "evlog/elysia";
import { resendEmailController } from "./resend-email.controllers";

/**
 * Platform-admin resend: re-sends a failed email as its original
 * organization from the console. Goes through the normal send path
 * (guards, credits, new log row); the failed row is left as-is.
 */
export const adminResendEmailRoute = new Elysia()
	.use(evlog())
	.use(authMiddleware)
	.post(
		"/admin/resend/:id",
		async ({ params: { id }, userId, log }) => {
			const email = await db.query.emailLog.findFirst({
				where: eq(schema.emailLog.id, id),
				columns: {
					id: true,
					organizationId: true,
					userId: true,
					status: true,
					attachments: true,
				},
			});
			if (!email) {
				throw createError({
					status: 404,
					message: "Email not found",
					why: `No email log with id ${id}`,
					fix: "Check the email ID and try again",
				});
			}
			if (email.status !== "failed") {
				throw createError({
					status: 400,
					message: "Only failed emails can be resent",
					why: `This email is ${email.status}`,
				});
			}
			// Attachment bytes aren't kept on the log, so a resend would
			// silently go out without them.
			if ((email.attachments ?? []).length > 0) {
				throw createError({
					status: 400,
					message: "Emails with attachments can't be resent",
					why: "The resent copy would be missing its attachments",
					fix: "Ask the sender to send this email again",
				});
			}

			log.info("Admin resending failed email", {
				emailId: id,
				organizationId: email.organizationId,
				adminUserId: userId,
			});

			return await resendEmailController({
				emailId: id,
				organizationId: email.organizationId,
				apiKey: mailConfig.RELOOP_INTERNAL_SECRET,
				userId: email.userId ?? userId,
				useInternalInject: true,
			});
		},
		{
			authAdmin: true,
			params: t.Object({
				id: t.String({ minLength: 1, description: "Email log ID to resend" }),
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
				503: MailModel.badRequest,
				429: MailModel.tooManyRequests,
				500: MailModel.internalServerError,
			},
			detail: {
				summary: "Resend a failed email (platform admin)",
				hide: true,
				tags: ["Mail"],
			},
		},
	);
