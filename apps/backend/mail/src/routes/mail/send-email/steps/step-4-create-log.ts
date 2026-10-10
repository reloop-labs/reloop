import { serializeSendAttachments } from "@reloop/be-mail/lib/email-log-attachments";
import { IdempotentReplayError, MailErrors } from "@reloop/be-mail/lib/errors";
import type { MailModel } from "@reloop/be-mail/model/mail.model";
import { sourceFromTags } from "@reloop/db";
import { db } from "@reloop/db/client";
import { emailLog } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";

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
	idempotencyKey,
}: {
	organizationId: string;
	domainId: string;
	body: MailModel.SendEmailBody;
	apikeyId?: string;
	userId?: string;
	idempotencyKey?: string;
}) {
	const key = idempotencyKey?.trim().slice(0, 500) || undefined;
	async function insertLog() {
		const [record] = await db
			.insert(emailLog)
			.values({
				messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
				idempotencyKey: key,
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
			attachments: serializeSendAttachments(body.attachments),
			status: "pending",
			provider: "kumomta",
			source: sourceFromTags(body.tags),
			tags: body.tags ?? [],
			size: (body.text?.length || 0) + (body.html?.length || 0),
		})
		.returning({ id: emailLog.id });
		return record;
	}
	let logRecord: { id: string } | undefined;
	try {
		logRecord = await insertLog();
	} catch (error) {
		// Concurrent same-key send won the race — hand the winner's id back
		// so the caller refunds its reservation and returns the original.
		// Exception: the winner failed transmission — free its key and retry
		// as a fresh send instead of replaying the failure.
		const code = (error as { code?: string })?.code;
		const msg = error instanceof Error ? error.message : String(error);
		if (key && (code === "23505" || msg.includes("duplicate key"))) {
			const winner = await db.query.emailLog.findFirst({
				where: and(
					eq(emailLog.organizationId, organizationId),
					eq(emailLog.idempotencyKey, key),
				),
				columns: { id: true, status: true },
			});
			if (winner) {
				if (winner.status === "failed") {
					await db
						.update(emailLog)
						.set({ idempotencyKey: null })
						.where(eq(emailLog.id, winner.id));
					logRecord = await insertLog();
				} else {
					throw new IdempotentReplayError(winner.id);
				}
			} else {
				throw error;
			}
		} else {
			throw error;
		}
	}

	if (!logRecord) {
		throw MailErrors.databaseError("Failed to create email log record");
	}

	return { emailLogId: logRecord.id };
}
