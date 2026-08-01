import { MailErrors } from "@reloop/be-mail/lib/errors";
import type { MailModel } from "@reloop/be-mail/model/mail.model";
import { db } from "@reloop/db/client";
import { emailLog } from "@reloop/db/schema";

function parseFromName(from: string): string {
	// Handle "Display Name <email@domain.com>" format (incl. nested wrappers)
	const displayNameMatch = from.match(/^(.+?)\s*<[^>]+>$/);
	if (displayNameMatch?.[1]) {
		const name = displayNameMatch[1].trim().replace(/^["']|["']$/g, "");
		if (name && !name.includes("<") && !name.includes("@")) return name;
	}
	const bare = parseFromEmail(from);
	return bare.split("@")[0] ?? from;
}

function parseFromEmail(from: string): string {
	let current = from.trim();
	for (let i = 0; i < 5; i++) {
		const angled = current.match(/<([^<>]+@[^<>]+)>/);
		if (angled?.[1]) {
			current = angled[1].trim();
			continue;
		}
		break;
	}
	const match = current.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
	return (match?.[0] ?? current).trim();
}

function resolveLogUserId(userId?: string): string | undefined {
	// Internal cron/flush uses a synthetic "system" principal for auth headers.
	// email_log.user_id FKs to user — never persist that placeholder.
	if (!userId || userId === "system") return undefined;
	return userId;
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
			userId: resolveLogUserId(userId),
			apikeyId,
			fromEmail: parseFromEmail(body.from),
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
