import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { inboundEmail, mailbox } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import { simpleParser } from "mailparser";
import { correlateInboundThread } from "../../lib/thread-correlation";

export async function receiveInboundEmailController(rawMessage: string) {
	const log = useLogger();
	log.info(`[INBOX] Received raw email (length: ${rawMessage.length})`);

	try {
		const parsed = await simpleParser(rawMessage);
		const fromEmail = parsed.from?.value[0]?.address || "unknown";
		const fromName = parsed.from?.value[0]?.name || undefined;
		let toEmails: string[] = [];
		if (Array.isArray(parsed.to)) {
			toEmails = parsed.to.flatMap((t) => t.value.map((v) => v.address || ""));
		} else if (parsed.to) {
			toEmails = parsed.to.value.map((v) => v.address || "");
		}

		toEmails = toEmails.filter(Boolean);

		const recipientEmail = toEmails[0];
		if (!recipientEmail) {
			log.warn("[INBOX] No valid recipient found in email");
			return new Response("No valid recipient", { status: 400 });
		}

		const subject = parsed.subject || "";
		const textBody = parsed.text || "";
		const htmlBody = (parsed.html as string) || "";
		const messageId = parsed.messageId || "";
		const inReplyTo = parsed.inReplyTo || "";
		const references: string[] = Array.isArray(parsed.references)
			? parsed.references
			: parsed.references
				? [parsed.references]
				: [];

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

		// Store email
		const inserted = await db
			.insert(inboundEmail)
			.values({
				mailboxId: mailboxRecord.id,
				organizationId: mailboxRecord.organizationId,
				fromEmail: fromEmail,
				toEmails: toEmails,
				subject: subject,
				textBody: textBody,
				htmlBody: htmlBody,
				rawMessage: rawMessage, // Optional, might want to store in S3 if large
				messageId: messageId,
				threadId: inReplyTo || references[0] || "",
			})
			.returning({ id: inboundEmail.id });

		const insertedId = inserted?.[0]?.id;
		if (!insertedId) {
			return new Response("Failed to insert email", { status: 500 });
		}

		// ── Thread correlation ─────────────────────────────────────
		// Find existing thread (via In-Reply-To / References) or create new one
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

		// Handle attachments (TODO: S3 upload)

		await bus.publish(BusEvent.INBOUND_EMAIL_RECEIVED, {
			inboundEmailId: insertedId,
			mailboxId: mailboxRecord.id,
			organizationId: mailboxRecord.organizationId,
			messageId: messageId,
			fromEmail: fromEmail,
			toEmails: toEmails,
			subject: subject,
			threadId: threadResult.threadId,
		});

		log.info(
			`[INBOX] Successfully saved email for ${recipientEmail} with id ${insertedId} (thread: ${threadResult.threadId}, new: ${threadResult.isNew})`,
		);
		return { success: true, id: insertedId, threadId: threadResult.threadId };
	} catch (err) {
		log.error(
			`[INBOX] Error processing inbound email: ${err instanceof Error ? err.message : String(err)}`,
		);
		return new Response("Internal error processing email", { status: 500 });
	}
}

