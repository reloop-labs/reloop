import { db } from "@reloop/db/client";
import { inboundEmail, mailbox, threadMessage } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { proxySendToMailService } from "../messages.helper";

export async function replyAllToMessageController(
	messageId: string,
	organizationId: string,
	body: {
		text?: string;
		html?: string;
		to?: string | string[];
		cc?: string | string[];
		bcc?: string | string[];
		attachments?: Array<{
			content?: string;
			filename?: string;
			path?: string;
			content_type?: string;
			content_id?: string;
		}>;
	},
	apiKey: string,
	cookie?: string,
) {
	const log = useLogger();

	// Fetch original message
	const original = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, messageId),
			eq(inboundEmail.organizationId, organizationId),
		),
	});

	if (!original) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${messageId} was not found in your organization`,
			fix: "Verify the message ID",
		});
	}

	// Resolve the mailbox to get our email
	const mbx = await db.query.mailbox.findFirst({
		where: eq(mailbox.id, original.mailboxId),
	});

	const ourEmail = mbx?.email || "";

	// Find the thread
	const threadMsg = await db.query.threadMessage.findFirst({
		where: eq(threadMessage.inboundEmailId, messageId),
		columns: { threadId: true },
	});

	// Build reply-all recipients
	// To: original sender (or client override)
	const defaultReplyTo = original.replyTo || original.fromEmail;
	const replyTo = body.to ?? defaultReplyTo;

	// CC: original to + cc, excluding ourselves — or client override
	const defaultCc = [
		...(original.toEmails || []),
		...((original.ccEmails as string[]) || []),
	].filter((email) => email && email !== ourEmail && email !== defaultReplyTo);

	const replyCc = body.cc !== undefined ? body.cc : defaultCc;
	const ccList = Array.isArray(replyCc) ? replyCc : replyCc ? [replyCc] : [];

	const replySubject = original.subject?.startsWith("Re:")
		? original.subject
		: `Re: ${original.subject || ""}`;

	log.info(
		`[INBOX] Reply-all to message ${messageId} → ${Array.isArray(replyTo) ? replyTo.join(", ") : replyTo}, CC: ${ccList.join(", ")}`,
	);

	return proxySendToMailService(
		{
			mailboxId: original.mailboxId,
			organizationId,
			to: replyTo,
			subject: replySubject,
			text: body.text,
			html: body.html,
			cc: ccList.length > 0 ? ccList : undefined,
			bcc: body.bcc,
			attachments: body.attachments,
			threadId: threadMsg?.threadId || undefined,
			headers: original.messageId
				? { "In-Reply-To": original.messageId }
				: undefined,
		},
		apiKey,
		cookie,
	);
}
