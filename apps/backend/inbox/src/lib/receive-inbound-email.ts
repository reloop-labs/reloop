import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import {
	emailThread,
	inboundAttachment,
	inboundEmail,
	mailbox,
} from "@reloop/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { createError, log as evlog } from "evlog";
import { broadcastToOrg } from "../rooms/inbox.rooms";

const log = {
	info: (msg: string) => evlog.info("inbox", msg),
	warn: (msg: string) => evlog.warn("inbox", msg),
	error: (msg: string) => evlog.error("inbox", msg),
};

import { simpleParser } from "mailparser";
import { maybeForwardToDeliverabilityTester } from "./deliverability-tester";
import { correlateInboundThread } from "./thread-correlation";

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

function extractHeaders(
	headers: Map<string, unknown>,
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

	for (const [key, value] of headers) {
		if (key.startsWith("x-") && !(key in result)) {
			result[key] = typeof value === "string" ? value : String(value);
		}
	}

	return Object.keys(result).length > 0 ? result : undefined;
}

function extractSpamInfo(headers: Map<string, unknown>): {
	spamScore: number | null;
	isSpam: boolean;
} {
	const scoreHeader = headers.get("x-spam-score");
	if (scoreHeader) {
		const score = Number.parseFloat(String(scoreHeader));
		if (!Number.isNaN(score)) {
			return { spamScore: score, isSpam: score >= 5.0 };
		}
	}

	const flagHeader = headers.get("x-spam-flag");
	if (flagHeader) {
		const isSpam = String(flagHeader).toUpperCase() === "YES";
		return { spamScore: null, isSpam };
	}

	const statusHeader = headers.get("x-spam-status");
	if (statusHeader) {
		const isSpam = String(statusHeader).toLowerCase().startsWith("yes");
		const scoreMatch = String(statusHeader).match(/score=([0-9.-]+)/);
		const score = scoreMatch?.[1] ? Number.parseFloat(scoreMatch[1]) : null;
		return { spamScore: score, isSpam };
	}

	return { spamScore: null, isSpam: false };
}

export async function receiveInboundEmailController(rawMessage: string) {
	log.info(`[INBOX] Received raw email (length: ${rawMessage.length})`);

	try {
		const parsed = await simpleParser(rawMessage);

		const fromEmail = parsed.from?.value[0]?.address || "unknown";
		const fromName = parsed.from?.value[0]?.name || undefined;

		const toEmails = extractAddresses(parsed.to).filter(Boolean);
		const ccEmails = extractAddresses(parsed.cc).filter(Boolean);
		const bccEmails = extractAddresses(parsed.bcc).filter(Boolean);

		const replyTo = parsed.replyTo?.value?.[0]?.address || undefined;

		// The mailbox may be anywhere in To/Cc, or only in the envelope
		// (Bcc, mailing lists): try every candidate, To first.
		const headerValue = (key: string): string[] => {
			const v = parsed.headers?.get(key);
			if (!v) return [];
			const text = typeof v === "string" ? v : String(v);
			return text.match(/[^\s<>,;"]+@[^\s<>,;"]+/g) ?? [];
		};
		const candidates = [
			...toEmails,
			...ccEmails,
			...headerValue("x-original-to"),
			...headerValue("delivered-to"),
			...bccEmails,
		]
			.map((e) => e.toLowerCase().trim())
			.filter((e, i, all) => e.includes("@") && all.indexOf(e) === i);

		if (candidates.length === 0) {
			log.warn("[INBOX] No valid recipient found in email");
			throw createError({
				status: 400,
				message: "No valid recipient found in email",
				why: "The parsed email does not contain any recipient in the To or Cc headers",
				fix: "Verify the incoming raw email format",
			});
		}

		const subject = parsed.subject || "";
		const textBody = parsed.text || "";
		const htmlBody = (parsed.html as string) || "";
		const snippet =
			textBody.substring(0, 300).replace(/\s+/g, " ").trim() || undefined;

		const messageId = parsed.messageId || "";
		const inReplyTo = parsed.inReplyTo || "";
		const references: string[] = Array.isArray(parsed.references)
			? parsed.references
			: parsed.references
				? [parsed.references]
				: [];

		const headers = parsed.headers ? extractHeaders(parsed.headers) : undefined;
		const { spamScore, isSpam } = parsed.headers
			? extractSpamInfo(parsed.headers)
			: { spamScore: null, isSpam: false };

		const date = parsed.date || undefined;
		const size = rawMessage.length;

		// Plus-addressed recipients (user+alias@domain.com) fall back to the base.
		const lookup = new Map<string, string>();
		for (const addr of candidates) {
			lookup.set(addr, addr);
			const [localPart, domainPart] = addr.split("@");
			if (localPart?.includes("+") && domainPart) {
				const base = `${localPart.split("+")[0]}@${domainPart}`;
				if (!lookup.has(base)) lookup.set(base, addr);
			}
		}
		const matches = await db.query.mailbox.findMany({
			where: and(
				inArray(mailbox.email, [...lookup.keys()]),
				eq(mailbox.status, "active"),
			),
		});
		const order = [...lookup.keys()];
		matches.sort((a, b) => order.indexOf(a.email) - order.indexOf(b.email));
		const mailboxRecord = matches[0];
		const recipientEmail = candidates[0] ?? "";
		const normalizedRecipient = mailboxRecord
			? (lookup.get(mailboxRecord.email) ?? mailboxRecord.email)
			: recipientEmail;

		if (!mailboxRecord) {
			log.warn(`[INBOX] Mailbox not found or inactive for: ${recipientEmail}`);
			throw createError({
				status: 404,
				message: "Mailbox not found",
				why: `No active mailbox exists for any recipient: ${candidates.join(", ")}`,
				fix: "Verify that the mailbox is registered and active",
			});
		}

		if (messageId) {
			const existingInbound = await db.query.inboundEmail.findFirst({
				where: and(
					eq(inboundEmail.mailboxId, mailboxRecord.id),
					eq(inboundEmail.messageId, messageId),
				),
				columns: { id: true, threadId: true },
			});
			if (existingInbound) {
				log.info(`[INBOX] Duplicate email skipped for messageId: ${messageId}`);
				return { id: existingInbound.id, threadId: existingInbound.threadId };
			}
		}

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
			throw createError({
				status: 500,
				message: "Failed to insert email",
				why: "Database write returned an empty result",
				fix: "Check database logs and schema constraints",
			});
		}

		if (parsed.attachments && parsed.attachments.length > 0) {
			const attachmentRecords = parsed.attachments.map((att) => ({
				inboundEmailId: insertedId,
				filename: att.filename || "unnamed",
				contentType: att.contentType || "application/octet-stream",
				size: att.size || 0,
				// Bytes stay in raw_message; see lib/inbound-attachment-content.ts.
				storagePath: "",
				// multipart/related parts are body images even without a disposition.
				contentDisposition:
					(att.contentDisposition as string) ||
					(att.related ? "inline" : "attachment"),
				contentId: att.contentId || undefined,
				checksum: att.checksum || undefined,
			}));

			await db.insert(inboundAttachment).values(attachmentRecords);

			log.info(
				`[INBOX] Stored ${attachmentRecords.length} attachment(s) for email ${insertedId}`,
			);
		}

		const threadResult = await correlateInboundThread({
			mailboxId: mailboxRecord.id,
			organizationId: mailboxRecord.organizationId,
			inboundEmailId: insertedId,
			fromEmail,
			fromName,
			toEmails,
			ccEmails,
			subject,
			textBody,
			messageId,
			inReplyTo,
			references,
			receivedAt: new Date(),
		});

		if (!threadResult.threadId) {
			throw createError({
				status: 500,
				message: "Failed to correlate thread",
				why: "Database failed to create or find a thread for this email",
				fix: "Check database logs",
			});
		}

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

		try {
			const emailRecord = await db.query.inboundEmail.findFirst({
				where: eq(inboundEmail.id, insertedId),
				with: { attachments: true },
			});
			const threadRecord = await db.query.emailThread.findFirst({
				where: eq(emailThread.id, threadResult.threadId),
			});

			if (emailRecord) {
				const fullMessage = {
					...emailRecord,
					threadId: threadResult.threadId,
				};
				const fullThread = threadRecord
					? {
							...threadRecord,
							participants: threadRecord.participants || [],
							labels: [],
						}
					: null;

				broadcastToOrg(
					mailboxRecord.organizationId,
					{
						type: "inbound_email_received",
						data: {
							email: fullMessage,
							thread: fullThread,
							mailboxId: mailboxRecord.id,
							threadId: threadResult.threadId,
						},
					},
					mailboxRecord.id,
				);
			}
		} catch (broadcastErr) {
			log.warn(`[INBOX] Failed to broadcast websocket event: ${broadcastErr}`);
		}

		log.info(
			`[INBOX] Successfully saved email for ${recipientEmail} with id ${insertedId} (thread: ${threadResult.threadId}, new: ${threadResult.isNew}, attachments: ${parsed.attachments?.length || 0}, spam: ${isSpam})`,
		);

		// Tester addresses are plus-aliases of a real mailbox, so they land
		// here even when the tools NATS subscriber missed the inbound event.
		void maybeForwardToDeliverabilityTester(rawMessage, [
			...toEmails,
			...ccEmails,
			normalizedRecipient,
		]).catch((forwardErr) => {
			log.warn(`[INBOX] Deliverability tester forward failed: ${forwardErr}`);
		});

		return { success: true, id: insertedId, threadId: threadResult.threadId };
	} catch (err) {
		if (err && typeof err === "object" && "status" in err) {
			throw err;
		}
		log.error(
			`[INBOX] Error processing inbound email: ${err instanceof Error ? err.message : String(err)}`,
		);
		throw createError({
			status: 500,
			message: "Internal error processing email",
			why: err instanceof Error ? err.message : String(err),
			fix: "Check service logs",
		});
	}
}
