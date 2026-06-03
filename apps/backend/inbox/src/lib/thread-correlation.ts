import { db } from "@reloop/db/client";
import { emailThread, threadMessage } from "@reloop/db/schema";
import { eq, sql } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

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
	const log = useLogger();
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
			log.info(
				`[THREAD] Matched thread via In-Reply-To: ${existingThreadId}`,
			);
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
				log.info(
					`[THREAD] Matched thread via References: ${existingThreadId}`,
				);
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

		log.info(
			`[THREAD] Appended inbound message to thread ${existingThreadId}`,
		);
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
	const log = useLogger();
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
