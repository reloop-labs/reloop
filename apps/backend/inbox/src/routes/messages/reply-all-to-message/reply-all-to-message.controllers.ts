import { db } from "@reloop/db/client";
import {
	emailLog,
	inboundEmail,
	mailbox,
	threadMessage,
} from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { resolveThreadIdForMessage } from "../../../lib/thread-correlation";
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
		threadId?: string;
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
	let originalToEmails = originalInbound?.toEmails ?? [];
	let originalCcEmails = (originalInbound?.ccEmails as string[]) ?? [];

	if (!originalInbound) {
		const outboundLog = await db.query.emailLog.findFirst({
			where: and(
				eq(emailLog.id, messageId),
				eq(emailLog.organizationId, organizationId),
			),
		});

		if (!outboundLog) {
			const fallbackThreadId =
				body.threadId ||
				(await resolveThreadIdForMessage(messageId, organizationId));
			const lastInbound = fallbackThreadId
				? await db.query.threadMessage.findFirst({
						where: and(
							eq(threadMessage.threadId, fallbackThreadId),
							eq(threadMessage.direction, "inbound"),
						),
						orderBy: (m, { desc }) => [desc(m.messageAt)],
					})
				: null;
			const inb = lastInbound?.inboundEmailId
				? await db.query.inboundEmail.findFirst({
						where: eq(inboundEmail.id, lastInbound.inboundEmailId),
					})
				: null;
			if (!inb) {
				throw createError({
					status: 404,
					message: "Message not found",
					why: `Message ${messageId} was not found in your organization`,
					fix: "Verify the message ID",
				});
			}
			mailboxId = inb.mailboxId;
			defaultReplyTo = inb.replyTo ?? inb.fromEmail ?? "";
			originalToEmails = inb.toEmails ?? [];
			originalCcEmails = (inb.ccEmails as string[]) ?? [];
			originalSubject = inb.subject || lastInbound?.subject || "";
			headerMsgId = inb.messageId ?? lastInbound?.rfc822MessageId ?? null;
		} else {
			const mbx = await db.query.mailbox.findFirst({
				where: and(
					eq(mailbox.organizationId, organizationId),
					eq(mailbox.email, outboundLog.fromEmail),
				),
			});
			const firstMbx =
				mbx ||
				(await db.query.mailbox.findFirst({
					where: eq(mailbox.organizationId, organizationId),
				}));

			mailboxId = firstMbx?.id ?? "";
			const toArray = Array.isArray(outboundLog.toEmails)
				? (outboundLog.toEmails as string[])
				: [];
			defaultReplyTo =
				toArray[0] || outboundLog.replyTo || outboundLog.fromEmail;
			originalToEmails = toArray;
			originalCcEmails = Array.isArray(outboundLog.ccEmails)
				? (outboundLog.ccEmails as string[])
				: [];
			originalSubject = outboundLog.subject || "";
			headerMsgId = outboundLog.messageId || null;
		}
	}

	const resolvedThreadId =
		body.threadId ||
		(await resolveThreadIdForMessage(messageId, organizationId));

	// Resolve mailbox to get our email
	const mbx = await db.query.mailbox.findFirst({
		where: eq(mailbox.id, mailboxId ?? ""),
	});

	const ourEmail = mbx?.email || "";

	// Build reply-all recipients
	const replyTo = body.to ?? defaultReplyTo;

	const defaultCc = [...originalToEmails, ...originalCcEmails].filter(
		(email) => email && email !== ourEmail && email !== defaultReplyTo,
	);

	const replyCc = body.cc !== undefined ? body.cc : defaultCc;
	const ccList = Array.isArray(replyCc) ? replyCc : replyCc ? [replyCc] : [];

	const replySubject = originalSubject.startsWith("Re:")
		? originalSubject
		: `Re: ${originalSubject}`;

	log.info(
		`[INBOX] Reply-all to message ${messageId} → ${Array.isArray(replyTo) ? replyTo.join(", ") : replyTo}, CC: ${ccList.join(", ")}`,
	);

	return proxySendToMailService(
		{
			mailboxId: mailboxId ?? "",
			organizationId,
			to: replyTo,
			subject: replySubject,
			text: body.text,
			html: body.html,
			cc: ccList.length > 0 ? ccList : undefined,
			bcc: body.bcc,
			attachments: body.attachments,
			threadId: resolvedThreadId,
			headers: headerMsgId ? { "In-Reply-To": headerMsgId } : undefined,
		},
		apiKey,
		cookie,
	);
}
