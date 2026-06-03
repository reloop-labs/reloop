import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { inboundAttachment, inboundEmail, mailbox } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import { simpleParser } from "mailparser";
import { correlateInboundThread } from "../../lib/thread-correlation";

/**
 * Helper: extract email addresses from a mailparser AddressObject
 */
function extractAddresses(
	field:
		| import("mailparser").AddressObject
		| import("mailparser").AddressObject[]
		| undefined,
): string[] {
	if (!field) return [];
	if (Array.isArray(field)) {
		return field.flatMap((f) => f.value.map((v) => v.address || ""));
	}
	return field.value.map((v) => v.address || "");
}

/**
 * Helper: extract key headers into a flat Record for storage.
 * We store a curated set of headers rather than the entire Map.
 */
function extractHeaders(
	headers: Map<string, any>,
): Record<string, string> | undefined {
	const keysToStore = [
		"dkim-signature",
		"authentication-results",
		"received-spf",
		"arc-seal",
		"arc-message-signature",
		"arc-authentication-results",
		"x-spam-status",
		"x-spam-score",
		"x-spam-flag",
		"x-mailer",
		"x-original-to",
		"x-forwarded-to",
		"x-forwarded-for",
		"x-priority",
		"x-originating-ip",
		"list-unsubscribe",
		"list-id",
		"precedence",
		"auto-submitted",
		"content-language",
		"mime-version",
	];

	const result: Record<string, string> = {};
	for (const key of keysToStore) {
		const value = headers.get(key);
		if (value) {
			result[key] = typeof value === "string" ? value : String(value);
		}
	}

	// Also include any user-defined X-headers not in our curated list
	for (const [key, value] of headers) {
		if (key.startsWith("x-") && !(key in result)) {
			result[key] = typeof value === "string" ? value : String(value);
		}
	}

	return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Helper: extract spam score from headers.
 * Supports SpamAssassin's X-Spam-Score and X-Spam-Status formats.
 */
function extractSpamInfo(headers: Map<string, any>): {
	spamScore: number | null;
	isSpam: boolean;
} {
	// Try X-Spam-Score (numeric)
	const scoreHeader = headers.get("x-spam-score");
	if (scoreHeader) {
		const score = Number.parseFloat(String(scoreHeader));
		if (!Number.isNaN(score)) {
			return { spamScore: score, isSpam: score >= 5.0 };
		}
	}

	// Try X-Spam-Flag (YES/NO)
	const flagHeader = headers.get("x-spam-flag");
	if (flagHeader) {
		const isSpam = String(flagHeader).toUpperCase() === "YES";
		return { spamScore: null, isSpam };
	}

	// Try X-Spam-Status (starts with Yes/No)
	const statusHeader = headers.get("x-spam-status");
	if (statusHeader) {
		const isSpam = String(statusHeader).toLowerCase().startsWith("yes");
		// Try to extract score from "Yes, score=12.3"
		const scoreMatch = String(statusHeader).match(/score=([0-9.-]+)/);
		const score = scoreMatch ? Number.parseFloat(scoreMatch[1]) : null;
		return { spamScore: score, isSpam };
	}

	return { spamScore: null, isSpam: false };
}

export async function receiveInboundEmailController(rawMessage: string) {
	const log = useLogger();
	log.info(`[INBOX] Received raw email (length: ${rawMessage.length})`);

	try {
		const parsed = await simpleParser(rawMessage);

		// ── Sender ──────────────────────────────────────────────
		const fromEmail = parsed.from?.value[0]?.address || "unknown";
		const fromName = parsed.from?.value[0]?.name || undefined;

		// ── Recipients ──────────────────────────────────────────
		const toEmails = extractAddresses(parsed.to).filter(Boolean);
		const ccEmails = extractAddresses(parsed.cc).filter(Boolean);
		const bccEmails = extractAddresses(parsed.bcc).filter(Boolean);

		// ── Reply-To ────────────────────────────────────────────
		const replyTo = parsed.replyTo?.value?.[0]?.address || undefined;

		const recipientEmail = toEmails[0];
		if (!recipientEmail) {
			log.warn("[INBOX] No valid recipient found in email");
			return new Response("No valid recipient", { status: 400 });
		}

		// ── Content ─────────────────────────────────────────────
		const subject = parsed.subject || "";
		const textBody = parsed.text || "";
		const htmlBody = (parsed.html as string) || "";
		const snippet = textBody.substring(0, 300).replace(/\s+/g, " ").trim() || undefined;

		// ── Threading headers ───────────────────────────────────
		const messageId = parsed.messageId || "";
		const inReplyTo = parsed.inReplyTo || "";
		const references: string[] = Array.isArray(parsed.references)
			? parsed.references
			: parsed.references
				? [parsed.references]
				: [];

		// ── Headers & spam ──────────────────────────────────────
		const headers = parsed.headers
			? extractHeaders(parsed.headers)
			: undefined;
		const { spamScore, isSpam } = parsed.headers
			? extractSpamInfo(parsed.headers)
			: { spamScore: null, isSpam: false };

		// ── Date & size ─────────────────────────────────────────
		const date = parsed.date || undefined;
		const size = rawMessage.length;

		// ── Mailbox lookup ──────────────────────────────────────
		const mailboxRecord = await db.query.mailbox.findFirst({
			where: and(
				eq(mailbox.email, recipientEmail),
				eq(mailbox.status, "active"),
			),
		});

		if (!mailboxRecord) {
			log.warn(`[INBOX] Mailbox not found or inactive for: ${recipientEmail}`);
			return new Response("Mailbox not found", { status: 404 });
		}

		// ── Store email ─────────────────────────────────────────
		const inserted = await db
			.insert(inboundEmail)
			.values({
				mailboxId: mailboxRecord.id,
				organizationId: mailboxRecord.organizationId,
				fromEmail,
				fromName,
				toEmails,
				ccEmails: ccEmails.length > 0 ? ccEmails : undefined,
				bccEmails: bccEmails.length > 0 ? bccEmails : undefined,
				replyTo,
				subject,
				textBody,
				htmlBody,
				snippet,
				rawMessage,
				size,
				status: isSpam ? "spam" : "received",
				isSpam,
				spamScore,
				messageId,
				threadId: inReplyTo || references[0] || "",
				inReplyTo: inReplyTo || undefined,
				references: references.length > 0 ? references : undefined,
				headers,
				date,
			})
			.returning({ id: inboundEmail.id });

		const insertedId = inserted?.[0]?.id;
		if (!insertedId) {
			return new Response("Failed to insert email", { status: 500 });
		}

		// ── Store attachments ───────────────────────────────────
		if (parsed.attachments && parsed.attachments.length > 0) {
			const attachmentRecords = parsed.attachments.map((att) => ({
				inboundEmailId: insertedId,
				filename: att.filename || "unnamed",
				contentType: att.contentType || "application/octet-stream",
				size: att.size || 0,
				storagePath: "", // TODO: Upload to S3 and store path
				contentDisposition:
					(att.contentDisposition as string) || "attachment",
				contentId: att.contentId || undefined,
				checksum: att.checksum || undefined,
			}));

			await db.insert(inboundAttachment).values(attachmentRecords);

			log.info(
				`[INBOX] Stored ${attachmentRecords.length} attachment(s) for email ${insertedId}`,
			);
		}

		// ── Thread correlation ───────────────────────────────────
		const threadResult = await correlateInboundThread({
			mailboxId: mailboxRecord.id,
			organizationId: mailboxRecord.organizationId,
			inboundEmailId: insertedId,
			fromEmail,
			fromName,
			subject,
			textBody,
			messageId,
			inReplyTo,
			references,
			receivedAt: new Date(),
		});

		// ── Publish event ───────────────────────────────────────
		await bus.publish(BusEvent.INBOUND_EMAIL_RECEIVED, {
			inboundEmailId: insertedId,
			mailboxId: mailboxRecord.id,
			organizationId: mailboxRecord.organizationId,
			messageId,
			fromEmail,
			fromName,
			toEmails,
			ccEmails: ccEmails.length > 0 ? ccEmails : undefined,
			subject,
			threadId: threadResult.threadId,
			hasAttachments: (parsed.attachments?.length || 0) > 0,
			isSpam,
		});

		log.info(
			`[INBOX] Successfully saved email for ${recipientEmail} with id ${insertedId} (thread: ${threadResult.threadId}, new: ${threadResult.isNew}, attachments: ${parsed.attachments?.length || 0}, spam: ${isSpam})`,
		);
		return { success: true, id: insertedId, threadId: threadResult.threadId };
	} catch (err) {
		log.error(
			`[INBOX] Error processing inbound email: ${err instanceof Error ? err.message : String(err)}`,
		);
		return new Response("Internal error processing email", { status: 500 });
	}
}
