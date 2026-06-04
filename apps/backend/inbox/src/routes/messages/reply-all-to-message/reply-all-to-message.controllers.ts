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
		bcc?: string | string[];
	},
	apiKey: string,
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
	// To: original sender
	const replyTo = original.replyTo || original.fromEmail;

	// CC: original to + cc, excluding ourselves
	const allRecipients = [
		...(original.toEmails || []),
		...((original.ccEmails as string[]) || []),
	].filter((email) => email && email !== ourEmail && email !== replyTo);

	const replySubject = original.subject?.startsWith("Re:")
		? original.subject
		: `Re: ${original.subject || ""}`;

	log.info(
		`[INBOX] Reply-all to message ${messageId} → ${replyTo}, CC: ${allRecipients.join(", ")}`,
	);

	return proxySendToMailService(
		{
			mailboxId: original.mailboxId,
			organizationId,
			to: replyTo,
			subject: replySubject,
			text: body.text,
			html: body.html,
			cc: allRecipients.length > 0 ? allRecipients : undefined,
			bcc: body.bcc,
			threadId: threadMsg?.threadId || undefined,
			headers: original.messageId
				? { "In-Reply-To": original.messageId }
				: undefined,
		},
		apiKey,
	);
}
