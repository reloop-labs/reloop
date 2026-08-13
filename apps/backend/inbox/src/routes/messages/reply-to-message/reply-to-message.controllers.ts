import { db } from "@reloop/db/client";
import { emailLog, inboundEmail, mailbox, threadMessage } from "@reloop/db/schema";
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

	// Fetch original message (inbound or outbound log)
	const originalInbound = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, messageId),
			eq(inboundEmail.organizationId, organizationId),
		),
	});

	let mailboxId = originalInbound?.mailboxId;
	let defaultReplyTo: string | string[] =
		originalInbound?.replyTo ?? originalInbound?.fromEmail ?? "";
	let originalSubject = originalInbound?.subject ?? "";
	let headerMsgId = originalInbound?.messageId ?? null;
	let resolvedThreadId: string | undefined = undefined;

	if (!originalInbound) {
		const outboundLog = await db.query.emailLog.findFirst({
			where: and(
				eq(emailLog.id, messageId),
				eq(emailLog.organizationId, organizationId),
			),
		});

		if (!outboundLog) {
			throw createError({
				status: 404,
				message: "Message not found",
				why: `Message ${messageId} was not found in your organization`,
				fix: "Verify the message ID",
			});
		}

		// Resolve mailbox for outbound log
		const mbx = await db.query.mailbox.findFirst({
			where: and(
				eq(mailbox.organizationId, organizationId),
				eq(mailbox.email, outboundLog.fromEmail),
			),
		});
		const firstMbx = mbx || (await db.query.mailbox.findFirst({
			where: eq(mailbox.organizationId, organizationId),
		}));

		mailboxId = firstMbx?.id ?? "";
		const toArray = Array.isArray(outboundLog.toEmails)
			? (outboundLog.toEmails as string[])
			: [];
		defaultReplyTo = toArray[0] || outboundLog.replyTo || outboundLog.fromEmail;
		originalSubject = outboundLog.subject || "";
		headerMsgId = outboundLog.messageId || null;
	} else {
		// Find thread for inbound email
		const threadMsg = await db.query.threadMessage.findFirst({
			where: eq(threadMessage.inboundEmailId, messageId),
			columns: { threadId: true },
		});
		resolvedThreadId = threadMsg?.threadId;
	}

	// Build reply
	const replyTo = body.to ?? defaultReplyTo;
	const replySubject = originalSubject.startsWith("Re:")
		? originalSubject
		: `Re: ${originalSubject}`;

	log.info(
		`[INBOX] Replying to message ${messageId} → ${Array.isArray(replyTo) ? replyTo.join(", ") : replyTo} (thread: ${resolvedThreadId})`,
	);

	return proxySendToMailService(
		{
			mailboxId: mailboxId ?? "",
			organizationId,
			to: replyTo,
			subject: replySubject,
			text: body.text,
			html: body.html,
			cc: body.cc,
			bcc: body.bcc,
			attachments: body.attachments,
			threadId: resolvedThreadId,
			headers: headerMsgId ? { "In-Reply-To": headerMsgId } : undefined,
		},
		apiKey,
		cookie,
	);
}
