import type { MailModel } from "@reloop/be-mail/model/mail.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { sendEmailController } from "./send-email.controllers";

export async function resendEmailController({
	emailId,
	organizationId,
	apiKey,
	apiKeyId,
	userId,
	useInternalInject = false,
}: {
	emailId: string;
	organizationId: string;
	apiKey: string;
	apiKeyId?: string;
	userId?: string;
	useInternalInject?: boolean;
}): Promise<MailModel.SendEmailResponse> {
	const log = useLogger();
	log.info("Initiating email resend process", { emailId, organizationId });

	const emailLogEntry = await db.query.emailLog.findFirst({
		where: and(
			eq(schema.emailLog.id, emailId),
			eq(schema.emailLog.organizationId, organizationId),
		),
	});

	if (!emailLogEntry) {
		log.warn("Email log not found for resend", { emailId, organizationId });
		throw createError({
			status: 404,
			message: "Email log not found",
			why: `No email with ID "${emailId}" was found in your organization.`,
			fix: "Check the email ID and ensure it belongs to your active organization.",
		});
	}

	const from = emailLogEntry.fromName
		? `${emailLogEntry.fromName} <${emailLogEntry.fromEmail}>`
		: emailLogEntry.fromEmail;

	const body: MailModel.SendEmailBody = {
		from,
		to: emailLogEntry.toEmails,
		cc: emailLogEntry.ccEmails ?? undefined,
		bcc: emailLogEntry.bccEmails ?? undefined,
		reply_to: emailLogEntry.replyTo ?? undefined,
		subject: emailLogEntry.subject,
		text: emailLogEntry.textBody ?? undefined,
		html: emailLogEntry.htmlBody ?? undefined,
		headers: emailLogEntry.headers ?? undefined,
	};

	return await sendEmailController({
		organizationId,
		body,
		apiKey,
		apiKeyId: apiKeyId || emailLogEntry.apikeyId || undefined,
		userId: userId || emailLogEntry.userId || undefined,
		useInternalInject,
	});
}
