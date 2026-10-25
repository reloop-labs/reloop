import type { ApiKeyScope } from "@reloop/db/api-key-scope";
import { db } from "@reloop/db/client";
import {
	emailLog,
	emailThread,
	mailbox,
	threadMessage,
} from "@reloop/db/schema";
import { and, eq, inArray, or, type SQL, sql } from "drizzle-orm";
import { mapEmailLogAttachments } from "../../../lib/outbound-attachments";

function bareEmail(value: string): string {
	const match = value.match(/<([^>]+)>/);
	return (match?.[1] ?? value).trim().toLowerCase();
}

function escapeLike(value: string): string {
	return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * SQL matching sender addresses a restricted API key may see, or null when
 * the key allows nothing. fromEmail is stored bare or as "Name <address>".
 */
export function senderScopeCondition(keyScope: ApiKeyScope): SQL | null {
	const parts: SQL[] = [];
	for (const entry of keyScope.entries) {
		if (entry.domainDeleted) continue;
		if (entry.email) {
			parts.push(
				sql`lower(${emailLog.fromEmail}) = ${entry.email}`,
				sql`lower(${emailLog.fromEmail}) like ${`%<${escapeLike(entry.email)}>%`}`,
			);
		} else {
			const domain = escapeLike(entry.domain);
			parts.push(
				sql`lower(${emailLog.fromEmail}) like ${`%@${domain}`}`,
				sql`lower(${emailLog.fromEmail}) like ${`%@${domain}>%`}`,
			);
		}
	}
	return parts.length > 0 ? (or(...parts) ?? null) : null;
}

export async function getSentMessagesController(
	organizationId: string,
	mailboxId?: string,
	q?: string,
	/** Set for restricted API keys: only senders the key allows. */
	senderScope?: ApiKeyScope,
) {
	const conditions = [eq(emailLog.organizationId, organizationId)];

	if (senderScope) {
		const allowed = senderScopeCondition(senderScope);
		if (!allowed) return [];
		conditions.push(allowed);
	}

	if (mailboxId) {
		const mbx = await db.query.mailbox.findFirst({
			where: and(
				eq(mailbox.id, mailboxId),
				eq(mailbox.organizationId, organizationId),
			),
		});
		if (!mbx) {
			return [];
		}

		const email = bareEmail(mbx.email);
		// Match bare address or "Name <address>" stored in fromEmail.
		const mailboxMatch = or(
			eq(emailLog.fromEmail, mbx.email),
			eq(emailLog.fromEmail, email),
			sql`lower(${emailLog.fromEmail}) = ${email}`,
			sql`lower(${emailLog.fromEmail}) like ${`%<${email}>%`}`,
		);
		if (mailboxMatch) {
			conditions.push(mailboxMatch);
		}
	}

	const term = q?.trim();
	if (term) {
		const like = `%${term}%`;
		conditions.push(
			or(
				sql`cast(${emailLog.subject} as text) ilike ${like}`,
				sql`cast(${emailLog.textBody} as text) ilike ${like}`,
				sql`cast(${emailLog.fromEmail} as text) ilike ${like}`,
				sql`cast(${emailLog.toEmails} as text) ilike ${like}`,
			)!,
		);
	}

	const whereClause = and(...conditions);

	const sentEmails = await db.query.emailLog.findMany({
		where: whereClause,
		orderBy: (m, { desc }) => [desc(m.createdAt)],
		limit: 50,
	});

	if (sentEmails.length === 0) return [];

	const logIds = sentEmails.map((e) => e.id);
	const links = await db.query.threadMessage.findMany({
		where: inArray(threadMessage.emailLogId, logIds),
		columns: { emailLogId: true, threadId: true },
	});
	const threadIdByLog = new Map(
		links
			.filter((l): l is typeof l & { emailLogId: string } => !!l.emailLogId)
			.map((l) => [l.emailLogId, l.threadId]),
	);
	const threadIds = [...new Set(threadIdByLog.values())];
	const threads =
		threadIds.length > 0
			? await db.query.emailThread.findMany({
					where: and(
						eq(emailThread.organizationId, organizationId),
						inArray(emailThread.id, threadIds),
					),
					columns: { id: true, isStarred: true },
				})
			: [];
	const starredByThread = new Map(threads.map((t) => [t.id, t.isStarred]));

	return sentEmails.map((email) => {
		const threadId = threadIdByLog.get(email.id);
		const toEmails = Array.isArray(email.toEmails)
			? email.toEmails
			: email.toEmails
				? [String(email.toEmails)]
				: [];
		return {
			id: email.id,
			messageId: email.messageId,
			organizationId: email.organizationId,
			domainId: email.domainId,
			fromEmail: email.fromEmail,
			fromName: email.fromName ?? null,
			toEmails,
			ccEmails: Array.isArray(email.ccEmails) ? email.ccEmails : [],
			bccEmails: Array.isArray(email.bccEmails) ? email.bccEmails : [],
			subject: email.subject || "",
			textBody: email.textBody ?? null,
			htmlBody: email.htmlBody ?? null,
			status: email.status,
			errorMessage: email.errorMessage ?? null,
			createdAt: email.createdAt,
			threadId: threadId ?? null,
			isStarred: threadId ? Boolean(starredByThread.get(threadId)) : false,
			attachments: mapEmailLogAttachments(email.attachments),
		};
	});
}
