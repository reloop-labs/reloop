import { db } from "@reloop/db/client";
import {
	emailLog,
	emailThread,
	mailbox,
	threadMessage,
} from "@reloop/db/schema";
import { and, eq, or, sql } from "drizzle-orm";
import { createError, log as evlog } from "evlog";

const log = {
	info: (msg: string) => evlog.info("thread", msg),
	warn: (msg: string) => evlog.warn("thread", msg),
	error: (msg: string) => evlog.error("thread", msg),
};

function bareEmail(value: string): string {
	const match = value.match(/<([^>]+)>/);
	return (match?.[1] ?? value).trim().toLowerCase();
}

function uniqueParticipants(...groups: Array<string[] | null | undefined>) {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const group of groups) {
		for (const raw of group ?? []) {
			const addr = String(raw ?? "").trim();
			if (!addr) continue;
			const key = bareEmail(addr);
			if (!key || seen.has(key)) continue;
			seen.add(key);
			out.push(addr);
		}
	}
	return out;
}

/**
 * Finds or creates a thread for an inbound email.
 *
 * Threading strategy:
 * 1. Check `In-Reply-To` header → look for a thread_message with that rfc822MessageId
 * 2. Check `References` header → look for any thread_message matching those IDs
 * 3. If no match → create a new thread
 */
export async function correlateInboundThread({
	mailboxId,
	organizationId,
	inboundEmailId,
	fromEmail,
	fromName,
	subject,
	textBody,
	messageId,
	inReplyTo,
	references,
	receivedAt,
}: {
	mailboxId: string;
	organizationId: string;
	inboundEmailId: string;
	fromEmail: string;
	fromName?: string;
	subject: string;
	textBody: string;
	messageId: string;
	inReplyTo: string;
	references: string[];
	receivedAt: Date;
}) {
	const preview = textBody.substring(0, 200);

	// ─── Try to find an existing thread ──────────────────────────────
	let existingThreadId: string | null = null;

	// Strategy 1: Check In-Reply-To header
	if (inReplyTo) {
		const match = await db.query.threadMessage.findFirst({
			where: eq(threadMessage.rfc822MessageId, inReplyTo),
			columns: { threadId: true },
		});
		if (match) {
			existingThreadId = match.threadId;
			log.info(`[THREAD] Matched thread via In-Reply-To: ${existingThreadId}`);
		}
	}

	// Strategy 2: Check References header (walk backwards, most recent first)
	if (!existingThreadId && references.length > 0) {
		for (const ref of [...references].reverse()) {
			const match = await db.query.threadMessage.findFirst({
				where: eq(threadMessage.rfc822MessageId, ref),
				columns: { threadId: true },
			});
			if (match) {
				existingThreadId = match.threadId;
				log.info(`[THREAD] Matched thread via References: ${existingThreadId}`);
				break;
			}
		}
	}

	if (existingThreadId) {
		// ─── Append to existing thread ─────────────────────────────
		await db.insert(threadMessage).values({
			threadId: existingThreadId,
			direction: "inbound",
			inboundEmailId,
			fromEmail,
			fromName,
			subject,
			preview,
			messageAt: receivedAt,
			rfc822MessageId: messageId || undefined,
			inReplyTo: inReplyTo || undefined,
		});

		// Update thread counters and metadata
		await db
			.update(emailThread)
			.set({
				lastMessagePreview: preview,
				lastMessageAt: receivedAt,
				messageCount: sql`${emailThread.messageCount} + 1`,
				isRead: false, // New message → unread
				participants: sql`
					CASE
						WHEN ${emailThread.participants}::jsonb ? ${fromEmail}
						THEN ${emailThread.participants}
						ELSE ${emailThread.participants}::jsonb || to_jsonb(${fromEmail}::text)
					END
				`,
			})
			.where(eq(emailThread.id, existingThreadId));

		log.info(`[THREAD] Appended inbound message to thread ${existingThreadId}`);
		return { threadId: existingThreadId, isNew: false };
	}

	// ─── Create new thread ─────────────────────────────────────────
	const [newThread] = await db
		.insert(emailThread)
		.values({
			mailboxId,
			organizationId,
			subject: subject || "(No Subject)",
			lastMessagePreview: preview,
			lastMessageAt: receivedAt,
			messageCount: 1,
			participants: [fromEmail],
			isRead: false,
		})
		.returning({ id: emailThread.id });

	if (!newThread) {
		log.error("[THREAD] Failed to create new thread");
		return { threadId: null, isNew: false };
	}

	await db.insert(threadMessage).values({
		threadId: newThread.id,
		direction: "inbound",
		inboundEmailId,
		fromEmail,
		fromName,
		subject,
		preview,
		messageAt: receivedAt,
		rfc822MessageId: messageId || undefined,
		inReplyTo: inReplyTo || undefined,
	});

	log.info(`[THREAD] Created new thread ${newThread.id}`);
	return { threadId: newThread.id, isNew: true };
}

/**
 * Appends an outbound (sent) email to an existing thread.
 * Called from the mail send pipeline when `thread_id` is provided.
 */
export async function appendOutboundToThread({
	threadId,
	organizationId,
	emailLogId,
	fromEmail,
	fromName,
	subject,
	textBody,
	messageId,
	inReplyTo,
	sentAt,
}: {
	threadId: string;
	organizationId: string;
	emailLogId: string;
	fromEmail: string;
	fromName?: string;
	subject: string;
	textBody: string;
	messageId: string;
	inReplyTo?: string;
	sentAt: Date;
}) {
	const preview = textBody.substring(0, 200);

	// Verify thread exists and belongs to the same org
	const thread = await db.query.emailThread.findFirst({
		where: eq(emailThread.id, threadId),
		columns: { id: true, organizationId: true },
	});

	if (!thread || thread.organizationId !== organizationId) {
		log.warn(
			`[THREAD] Thread ${threadId} not found or org mismatch for outbound append`,
		);
		return { success: false };
	}

	await db.insert(threadMessage).values({
		threadId,
		direction: "outbound",
		emailLogId,
		fromEmail,
		fromName,
		subject,
		preview,
		messageAt: sentAt,
		rfc822MessageId: messageId || undefined,
		inReplyTo: inReplyTo || undefined,
	});

	// Update thread counters and metadata
	await db
		.update(emailThread)
		.set({
			lastMessagePreview: preview,
			lastMessageAt: sentAt,
			messageCount: sql`${emailThread.messageCount} + 1`,
			participants: sql`
				CASE
					WHEN ${emailThread.participants}::jsonb ? ${fromEmail}
					THEN ${emailThread.participants}
					ELSE ${emailThread.participants}::jsonb || to_jsonb(${fromEmail}::text)
				END
			`,
		})
		.where(eq(emailThread.id, threadId));

	log.info(`[THREAD] Appended outbound message to thread ${threadId}`);
	return { success: true };
}

/**
 * Ensures a conversation thread exists for an outbound email_log.
 * Compose-from-inbox historically created logs without a thread; starring,
 * Sent detail, and reply-all need a thr_ link. Creates one lazily when missing.
 */
export async function ensureOutboundThreadForEmailLog({
	emailLogId,
	organizationId,
	mailboxId,
}: {
	emailLogId: string;
	organizationId: string;
	mailboxId?: string | null;
}): Promise<{ threadId: string; created: boolean }> {
	const existing = await db.query.threadMessage.findFirst({
		where: eq(threadMessage.emailLogId, emailLogId),
		columns: { threadId: true },
	});
	if (existing?.threadId) {
		return { threadId: existing.threadId, created: false };
	}

	const logRow = await db.query.emailLog.findFirst({
		where: and(
			eq(emailLog.id, emailLogId),
			eq(emailLog.organizationId, organizationId),
		),
	});
	if (!logRow) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${emailLogId} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}

	let resolvedMailboxId = mailboxId ?? null;
	if (!resolvedMailboxId) {
		const fromBare = bareEmail(logRow.fromEmail);
		const mbx = await db.query.mailbox.findFirst({
			where: and(
				eq(mailbox.organizationId, organizationId),
				or(
					eq(mailbox.email, logRow.fromEmail),
					eq(mailbox.email, fromBare),
					sql`lower(${mailbox.email}) = ${fromBare}`,
				),
			),
			columns: { id: true },
		});
		resolvedMailboxId = mbx?.id ?? null;
	}

	const preview = (logRow.textBody || logRow.subject || "").substring(0, 200);
	const messageAt = logRow.sentAt ?? logRow.createdAt ?? new Date();
	const participants = uniqueParticipants(
		[logRow.fromEmail],
		logRow.toEmails,
		logRow.ccEmails,
	);

	const [newThread] = await db
		.insert(emailThread)
		.values({
			mailboxId: resolvedMailboxId,
			organizationId,
			subject: logRow.subject || "(No Subject)",
			lastMessagePreview: preview,
			lastMessageAt: messageAt,
			messageCount: 1,
			participants,
			isRead: true,
		})
		.returning({ id: emailThread.id });

	if (!newThread) {
		throw createError({
			status: 500,
			message: "Failed to create conversation",
			why: `Could not create a thread for outbound message ${emailLogId}`,
			fix: "Retry the request",
		});
	}

	await db.insert(threadMessage).values({
		threadId: newThread.id,
		direction: "outbound",
		emailLogId,
		fromEmail: bareEmail(logRow.fromEmail) || logRow.fromEmail,
		fromName: logRow.fromName,
		subject: logRow.subject,
		preview,
		messageAt,
		rfc822MessageId: logRow.messageId || undefined,
	});

	log.info(
		`[THREAD] Created outbound thread ${newThread.id} for email_log ${emailLogId}`,
	);
	return { threadId: newThread.id, created: true };
}
