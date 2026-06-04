import { db } from "@reloop/db/client";
import { inboundEmail, threadMessage } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { proxySendToMailService } from "../messages.helper";

export async function replyToMessageController(
	messageId: string,
	organizationId: string,
	body: {
		text?: string;
		html?: string;
		cc?: string | string[];
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

	// Find the thread this message belongs to
	const threadMsg = await db.query.threadMessage.findFirst({
		where: eq(threadMessage.inboundEmailId, messageId),
		columns: { threadId: true },
	});

	// Build reply
	const replyTo = original.replyTo || original.fromEmail;
	const replySubject = original.subject?.startsWith("Re:")
		? original.subject
		: `Re: ${original.subject || ""}`;

	log.info(
		`[INBOX] Replying to message ${messageId} → ${replyTo} (thread: ${threadMsg?.threadId})`,
	);

	return proxySendToMailService(
		{
			mailboxId: original.mailboxId,
			organizationId,
			to: replyTo,
			subject: replySubject,
			text: body.text,
			html: body.html,
			cc: body.cc,
			bcc: body.bcc,
			threadId: threadMsg?.threadId || undefined,
			headers: original.messageId
				? { "In-Reply-To": original.messageId }
				: undefined,
		},
		apiKey,
	);
}
