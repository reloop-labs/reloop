import * as z from "zod";
import type {
	InboxAttachment,
	InboxMessage,
	InboxSendResponse,
	InboxThread,
	InboxThreadMessage,
	Mailbox,
	MailboxSentMessage,
} from "../../reloop/types";
import { resourceIdSchema } from "../contacts/schemas";
import { recipientsSchema } from "../email/schemas";

/** Bodies can be large newsletters; keep tool results within agent context. */
export const MAX_BODY_CHARS = 50_000;

export const mailboxIdSchema = resourceIdSchema.describe(
	"Mailbox ID as returned by list_mailboxes",
);
export const inboxMessageIdSchema = resourceIdSchema.describe(
	"Received message ID as returned by list_inbox_messages",
);
export const inboxThreadIdSchema = resourceIdSchema.describe(
	"Thread ID as returned by list_inbox_threads or a message's threadId",
);

export const limitSchema = z
	.number()
	.int()
	.min(1)
	.max(200)
	.default(25)
	.describe("Items per page, 1 to 200");
export const offsetSchema = z
	.number()
	.int()
	.min(0)
	.default(0)
	.describe("Items to skip, for pagination");

export const bodyTextSchema = z
	.string()
	.max(1_000_000)
	.optional()
	.describe("Plain-text body");
export const bodyHtmlSchema = z
	.string()
	.max(2_000_000)
	.optional()
	.describe("HTML body");

export const attachmentInputSchema = z
	.object({
		filename: z
			.string()
			.min(1)
			.max(255)
			.describe("File name shown to the recipient"),
		content: z
			.string()
			.max(10_000_000)
			.optional()
			.describe("Base64-encoded file content"),
		path: z
			.url()
			.optional()
			.describe(
				"Public URL Reloop downloads the file from, instead of content",
			),
		contentType: z
			.string()
			.max(255)
			.optional()
			.describe("MIME type, e.g. application/pdf"),
	})
	.refine((value) => value.content !== undefined || value.path !== undefined, {
		message: "Provide content or path",
	});

export const attachmentsInputSchema = z
	.array(attachmentInputSchema)
	.max(20)
	.optional()
	.describe("Files to attach");

export function toAttachmentInputs(
	attachments: z.output<typeof attachmentsInputSchema>,
) {
	return attachments?.map((attachment) => ({
		filename: attachment.filename,
		content: attachment.content,
		path: attachment.path,
		content_type: attachment.contentType,
	}));
}

export const recipientsInputSchema = recipientsSchema;

export const attachmentSchema = z.object({
	id: z.string(),
	filename: z.string(),
	contentType: z.string(),
	size: z.number().describe("Bytes"),
});

function toAttachment(attachment: InboxAttachment) {
	return {
		id: attachment.id,
		filename: attachment.filename,
		contentType: attachment.contentType,
		size: attachment.size,
	};
}

export const mailboxSchema = z.object({
	id: z.string(),
	email: z.string().describe("Address this mailbox receives at and sends from"),
	displayName: z.string().nullable(),
	status: z.string(),
	quota: z.string(),
	createdAt: z.string(),
});

export function toMailboxOutput(
	mailbox: Mailbox,
): z.output<typeof mailboxSchema> {
	return {
		id: mailbox.id,
		email: mailbox.email,
		displayName: mailbox.displayName,
		status: mailbox.status,
		quota: mailbox.quota,
		createdAt: String(mailbox.createdAt),
	};
}

export const inboxMessageSummarySchema = z.object({
	id: z.string(),
	mailboxId: z.string(),
	threadId: z.string().nullable(),
	from: z.string().describe("Sender address"),
	fromName: z.string().nullable(),
	to: z.array(z.string()),
	subject: z.string().nullable(),
	snippet: z.string().nullable().describe("Short preview of the body"),
	isRead: z.boolean(),
	isStarred: z.boolean(),
	isSpam: z.boolean(),
	attachmentCount: z.number().int(),
	receivedAt: z.string(),
});

export function toInboxMessageSummary(
	message: InboxMessage,
): z.output<typeof inboxMessageSummarySchema> {
	return {
		id: message.id,
		mailboxId: message.mailboxId,
		threadId: message.threadId,
		from: message.fromEmail,
		fromName: message.fromName,
		to: message.toEmails,
		subject: message.subject,
		snippet: message.snippet,
		isRead: message.isRead,
		isStarred: message.isStarred,
		isSpam: message.isSpam,
		attachmentCount: message.attachments?.length ?? 0,
		receivedAt: String(message.date ?? message.createdAt),
	};
}

function truncate(body: string | null): {
	value: string | null;
	truncated: boolean;
} {
	if (body === null || body.length <= MAX_BODY_CHARS) {
		return { value: body, truncated: false };
	}
	return { value: body.slice(0, MAX_BODY_CHARS), truncated: true };
}

export const inboxMessageSchema = inboxMessageSummarySchema.extend({
	cc: z.array(z.string()),
	replyTo: z.string().nullable(),
	text: z.string().nullable().describe("Plain-text body"),
	html: z
		.string()
		.nullable()
		.describe("HTML body, only when there is no plain-text body"),
	bodyTruncated: z
		.boolean()
		.describe(`True when the body was cut at ${MAX_BODY_CHARS} characters`),
	spamScore: z.number().nullable(),
	attachments: z.array(attachmentSchema),
});

export function toInboxMessageOutput(
	message: InboxMessage,
): z.output<typeof inboxMessageSchema> {
	const text = truncate(message.textBody);
	const html =
		text.value === null
			? truncate(message.htmlBody)
			: { value: null, truncated: false };
	return {
		...toInboxMessageSummary(message),
		cc: message.ccEmails ?? [],
		replyTo: message.replyTo,
		text: text.value,
		html: html.value,
		bodyTruncated: text.truncated || html.truncated,
		spamScore: message.spamScore,
		attachments: (message.attachments ?? []).map(toAttachment),
	};
}

export const sentMessageSchema = z.object({
	id: z.string(),
	threadId: z.string().nullable(),
	from: z.string(),
	to: z.array(z.string()),
	cc: z.array(z.string()),
	subject: z.string(),
	snippet: z.string().nullable(),
	status: z.string(),
	errorMessage: z.string().nullable(),
	sentAt: z.string(),
});

export function toSentMessageOutput(
	message: MailboxSentMessage,
): z.output<typeof sentMessageSchema> {
	return {
		id: message.id,
		threadId: message.threadId ?? null,
		from: message.fromEmail,
		to: message.toEmails,
		cc: message.ccEmails ?? [],
		subject: message.subject,
		snippet: message.textBody?.slice(0, 200) ?? null,
		status: message.status,
		errorMessage: message.errorMessage ?? null,
		sentAt: String(message.createdAt),
	};
}

export const threadSummarySchema = z.object({
	id: z.string(),
	mailboxId: z.string().nullable(),
	subject: z.string().nullable(),
	preview: z.string().nullable().describe("Preview of the latest message"),
	participants: z.array(z.string()),
	messageCount: z.number().int(),
	status: z.string().describe("active, archived, closed, or trash"),
	isRead: z.boolean(),
	isStarred: z.boolean(),
	isImportant: z.boolean(),
	isPinned: z.boolean(),
	labels: z.array(z.string()),
	lastMessageAt: z.string(),
});

export function toThreadSummary(
	thread: InboxThread,
): z.output<typeof threadSummarySchema> {
	return {
		id: thread.id,
		mailboxId: thread.mailboxId,
		subject: thread.subject,
		preview: thread.lastMessagePreview,
		participants: thread.participants,
		messageCount: thread.messageCount,
		status: thread.status,
		isRead: thread.isRead,
		isStarred: thread.isStarred,
		isImportant: thread.isImportant ?? false,
		isPinned: thread.isPinned ?? false,
		labels: (thread.labels ?? []).map((label) => label.name),
		lastMessageAt: String(thread.lastMessageAt),
	};
}

export const threadMessageSchema = z.object({
	id: z.string(),
	direction: z.string().describe("inbound (received) or outbound (sent)"),
	messageId: z
		.string()
		.nullable()
		.describe(
			"Received message ID to pass to reply_to_inbox_message or forward_inbox_message; null for sent messages",
		),
	from: z.string(),
	fromName: z.string().nullable(),
	to: z.array(z.string()),
	cc: z.array(z.string()),
	subject: z.string().nullable(),
	text: z.string().nullable(),
	bodyTruncated: z.boolean(),
	status: z.string().nullable().describe("Delivery status for sent messages"),
	attachments: z.array(attachmentSchema),
	at: z.string(),
});

export function toThreadMessage(
	message: InboxThreadMessage,
): z.output<typeof threadMessageSchema> {
	const email = message.email;
	const text = truncate(email?.textBody ?? message.preview ?? null);
	return {
		id: message.id,
		direction: message.direction,
		messageId: message.inboundEmailId ?? null,
		from: message.fromEmail,
		fromName: message.fromName ?? null,
		to: email?.toEmails ?? [],
		cc: email?.ccEmails ?? [],
		subject: message.subject ?? null,
		text: text.value,
		bodyTruncated: text.truncated,
		status: email?.status ?? null,
		attachments: (email?.attachments ?? []).map(toAttachment),
		at: String(message.messageAt),
	};
}

export const sendResultSchema = z.object({
	id: z
		.string()
		.describe(
			"Email log ID, or the pending send ID when scheduled or undoable",
		),
	messageId: z.string(),
	status: z.string().describe("sent, queued, or pending"),
	sendAt: z
		.string()
		.nullable()
		.describe(
			"When a pending send goes out; cancel it before then with cancel_pending_mailbox_send",
		),
});

export function toSendResult(
	response: InboxSendResponse,
): z.output<typeof sendResultSchema> {
	if ("pending" in response) {
		return {
			id: response.id,
			messageId: response.messageId,
			status: "pending",
			sendAt: response.sendAt,
		};
	}
	return {
		id: response.id,
		messageId: response.messageId,
		status: response.status,
		sendAt: null,
	};
}
