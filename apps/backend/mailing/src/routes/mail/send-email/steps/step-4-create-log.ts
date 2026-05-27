import { MailErrors } from "@reloop/be-mailing/lib/errors";
import type { MailModel } from "@reloop/be-mailing/model/mail.model";
import { db } from "@reloop/db/client";
import { emailLog } from "@reloop/db/schema";

function parseFromName(from: string): string {
	// Handle "Display Name <email@domain.com>" format
	const displayNameMatch = from.match(/^(.+?)\s*<[^>]+>$/);
	if (displayNameMatch?.[1]) {
		return displayNameMatch[1].trim();
	}
	// Fall back to local part of plain email
	return from.split("@")[0] ?? from;
}

export async function createEmailLog_step4({
	organizationId,
	domainId,
	body,
	apikeyId,
	userId,
}: {
	organizationId: string;
	domainId: string;
	body: MailModel.SendEmailBody;
	apikeyId?: string;
	userId?: string;
}) {
	const [logRecord] = await db
		.insert(emailLog)
		.values({
			messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
			organizationId,
			domainId: domainId,
			userId,
			apikeyId,
			fromEmail: body.from,
			fromName: parseFromName(body.from),
			toEmails: Array.isArray(body.to) ? body.to : [body.to],
			ccEmails: body.cc
				? Array.isArray(body.cc)
					? body.cc
					: [body.cc]
				: undefined,
			bccEmails: body.bcc
				? Array.isArray(body.bcc)
					? body.bcc
					: [body.bcc]
				: undefined,
			replyTo: Array.isArray(body.reply_to)
				? body.reply_to.join(", ")
				: body.reply_to,
			subject: body.subject,
			textBody: body.text,
			htmlBody: body.html,
			status: "pending",
			provider: "kumomta",
			size: (body.text?.length || 0) + (body.html?.length || 0),
		})
		.returning({ id: emailLog.id });

	if (!logRecord) {
		throw MailErrors.databaseError("Failed to create email log record");
	}

	return { emailLogId: logRecord.id };
}
