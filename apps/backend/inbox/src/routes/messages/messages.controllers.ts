import { db } from "@reloop/db/client";
import {
	emailThread,
	inboundAttachment,
	inboundEmail,
	mailbox,
	threadMessage,
} from "@reloop/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { inboxConfig } from "../../inbox.config";

// ─── Read operations ─────────────────────────────────────────────────

export async function getMessagesController(
	organizationId: string,
	mailboxId?: string,
) {
	const conditions = [eq(inboundEmail.organizationId, organizationId)];

	if (mailboxId) {
		conditions.push(eq(inboundEmail.mailboxId, mailboxId));
	}

	const whereClause = and(...conditions);

	const messages = await db.query.inboundEmail.findMany({
		where: whereClause,
		orderBy: (m, { desc }) => [desc(m.createdAt)],
		limit: 50,
		with: {
			attachments: true,
		},
	});

	return messages;
}

export async function getMessageController(id: string, organizationId: string) {
	const message = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, id),
			eq(inboundEmail.organizationId, organizationId),
		),
		with: {
			attachments: true,
		},
	});

	if (!message) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${id} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}
	return message;
}

export async function batchGetMessagesController(
	organizationId: string,
	ids: string[],
) {
	if (ids.length === 0) return [];
	if (ids.length > 100) {
		throw createError({
			status: 400,
			message: "Too many IDs",
			why: "Batch get supports a maximum of 100 message IDs at once",
			fix: "Reduce the number of IDs in your request",
		});
	}

	const messages = await db.query.inboundEmail.findMany({
		where: and(
			eq(inboundEmail.organizationId, organizationId),
			inArray(inboundEmail.id, ids),
		),
		with: {
			attachments: true,
		},
	});

	return messages;
}

export async function getMessageAttachmentController(
	messageId: string,
	attachmentId: string,
	organizationId: string,
) {
	// Verify message access
	const message = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, messageId),
			eq(inboundEmail.organizationId, organizationId),
		),
	});

	if (!message) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${messageId} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}

	const attachment = await db.query.inboundAttachment.findFirst({
		where: and(
			eq(inboundAttachment.id, attachmentId),
			eq(inboundAttachment.inboundEmailId, messageId),
		),
	});

	if (!attachment) {
		throw createError({
			status: 404,
			message: "Attachment not found",
			why: `Attachment ${attachmentId} was not found on message ${messageId}`,
			fix: "Verify the attachment ID",
		});
	}

	return {
		id: attachment.id,
		filename: attachment.filename,
		contentType: attachment.contentType,
		size: attachment.size,
		storagePath: attachment.storagePath,
		contentDisposition: attachment.contentDisposition,
		contentId: attachment.contentId,
		createdAt: attachment.createdAt,
	};
}

export async function getRawMessageController(
	id: string,
	organizationId: string,
) {
	const message = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, id),
			eq(inboundEmail.organizationId, organizationId),
		),
		columns: {
			rawMessage: true,
			messageId: true,
		},
	});

	if (!message) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${id} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}

	if (!message.rawMessage) {
		throw createError({
			status: 404,
			message: "Raw message not available",
			why: "The raw RFC822 message was not stored for this email",
			fix: "Raw message storage may be disabled for this mailbox",
		});
	}

	return {
		id,
		messageId: message.messageId,
		raw: message.rawMessage,
	};
}

// ─── Update operations ───────────────────────────────────────────────

export async function updateMessageController(
	id: string,
	organizationId: string,
	updates: {
		isRead?: boolean;
		isStarred?: boolean;
	},
) {
	const log = useLogger();

	const msg = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, id),
			eq(inboundEmail.organizationId, organizationId),
		),
	});

	if (!msg) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${id} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}

	const updateData: Record<string, any> = {};
	if (updates.isRead !== undefined) updateData.isRead = updates.isRead;
	if (updates.isStarred !== undefined) updateData.isStarred = updates.isStarred;

	if (Object.keys(updateData).length === 0) {
		return { success: true, id, message: "No changes" };
	}

	await db.update(inboundEmail).set(updateData).where(eq(inboundEmail.id, id));

	log.info(`[INBOX] Updated message ${id}: ${JSON.stringify(updateData)}`);
	return { success: true, id, ...updateData };
}

export async function markMessageReadController(
	id: string,
	organizationId: string,
	isRead: boolean,
) {
	return updateMessageController(id, organizationId, { isRead });
}

export async function toggleStarController(
	id: string,
	organizationId: string,
	isStarred: boolean,
) {
	return updateMessageController(id, organizationId, { isStarred });
}

// ─── Delete ──────────────────────────────────────────────────────────

export async function deleteMessageController(
	id: string,
	organizationId: string,
) {
	const log = useLogger();

	const msg = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, id),
			eq(inboundEmail.organizationId, organizationId),
		),
	});

	if (!msg) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${id} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}

	await db.delete(inboundEmail).where(eq(inboundEmail.id, id));

	log.info(`[INBOX] Deleted message ${id} (Org: ${organizationId})`);
	return { success: true };
}

// ─── Send / Reply / Forward ──────────────────────────────────────────
// These proxy to the mail service's send pipeline, injecting threading
// context automatically.

interface SendFromInboxParams {
	mailboxId: string;
	organizationId: string;
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
	cc?: string | string[];
	bcc?: string | string[];
	threadId?: string;
	headers?: Record<string, string>;
}

/**
 * Internal helper: Calls the mail service send endpoint.
 * The inbox service acts as a proxy, enriching the request with
 * the correct `from` address (the mailbox email) and threading context.
 */
async function proxySendToMailService(
	params: SendFromInboxParams,
	apiKey: string,
) {
	const log = useLogger();

	// Resolve the mailbox to get the from address
	const mbx = await db.query.mailbox.findFirst({
		where: and(
			eq(mailbox.id, params.mailboxId),
			eq(mailbox.organizationId, params.organizationId),
		),
	});

	if (!mbx) {
		throw createError({
			status: 404,
			message: "Mailbox not found",
			why: `Mailbox ${params.mailboxId} was not found`,
			fix: "Verify the mailbox ID",
		});
	}

	const fromAddress = mbx.displayName
		? `${mbx.displayName} <${mbx.email}>`
		: mbx.email;

	const sendBody: Record<string, any> = {
		from: fromAddress,
		to: params.to,
		subject: params.subject,
		text: params.text,
		html: params.html,
		cc: params.cc,
		bcc: params.bcc,
		thread_id: params.threadId,
		headers: params.headers,
	};

	// Remove undefined values
	for (const key of Object.keys(sendBody)) {
		if (sendBody[key] === undefined) delete sendBody[key];
	}

	// Proxy to the mail service
	const mailServiceUrl = `${inboxConfig.BASE_URL}/api/mail/v1/send`;
	log.info(`[INBOX] Proxying send to mail service: ${mailServiceUrl}`);

	const response = await fetch(mailServiceUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": apiKey,
		},
		body: JSON.stringify(sendBody),
	});

	if (!response.ok) {
		const errorBody = await response.text();
		log.error(`[INBOX] Mail service error: ${response.status} ${errorBody}`);
		throw createError({
			status: response.status as any,
			message: "Failed to send email",
			why: `Mail service returned ${response.status}`,
			fix: "Check mail service logs for details",
		});
	}

	return await response.json();
}

export async function sendMessageController(
	organizationId: string,
	body: {
		mailboxId: string;
		to: string | string[];
		subject: string;
		text?: string;
		html?: string;
		cc?: string | string[];
		bcc?: string | string[];
	},
	apiKey: string,
) {
	const log = useLogger();
	log.info(`[INBOX] Sending new message from mailbox ${body.mailboxId}`);

	return proxySendToMailService(
		{
			mailboxId: body.mailboxId,
			organizationId,
			to: body.to,
			subject: body.subject,
			text: body.text,
			html: body.html,
			cc: body.cc,
			bcc: body.bcc,
		},
		apiKey,
	);
}

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

export async function forwardMessageController(
	messageId: string,
	organizationId: string,
	body: {
		to: string | string[];
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

	// Build forward
	const fwdSubject = original.subject?.startsWith("Fwd:")
		? original.subject
		: `Fwd: ${original.subject || ""}`;

	// Construct forwarded body with original context
	const forwardHeader = [
		"---------- Forwarded message ----------",
		`From: ${original.fromName ? `${original.fromName} <${original.fromEmail}>` : original.fromEmail}`,
		`Date: ${original.date?.toISOString() || original.createdAt?.toISOString() || "Unknown"}`,
		`Subject: ${original.subject || "(No Subject)"}`,
		`To: ${original.toEmails?.join(", ") || ""}`,
		original.ccEmails
			? `Cc: ${(original.ccEmails as string[]).join(", ")}`
			: null,
		"",
	]
		.filter(Boolean)
		.join("\n");

	const forwardedText = body.text
		? `${body.text}\n\n${forwardHeader}\n${original.textBody || ""}`
		: `${forwardHeader}\n${original.textBody || ""}`;

	const forwardedHtml = body.html
		? `${body.html}<br><br><hr>${forwardHeader.replace(/\n/g, "<br>")}<br>${original.htmlBody || original.textBody || ""}`
		: original.htmlBody
			? `<hr>${forwardHeader.replace(/\n/g, "<br>")}<br>${original.htmlBody}`
			: undefined;

	log.info(
		`[INBOX] Forwarding message ${messageId} → ${JSON.stringify(body.to)}`,
	);

	return proxySendToMailService(
		{
			mailboxId: original.mailboxId,
			organizationId,
			to: body.to,
			subject: fwdSubject,
			text: forwardedText,
			html: forwardedHtml,
			cc: body.cc,
			bcc: body.bcc,
		},
		apiKey,
	);
}
