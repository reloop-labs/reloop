import { t } from "elysia";

export namespace MailModel {
	// Email validation pattern
	const emailPattern =
		/^(?:.*<[^\s@]+@[^\s@]+\.[^\s@]+>|[^\s@]+@[^\s@]+\.[^\s@]+)$/;
	const tagPattern = /^[a-zA-Z0-9_-]+$/;
	const variableKeyPattern =
		/^(?!FIRST_NAME$|LAST_NAME$|EMAIL$|UNSUBSCRIBE_URL$)[a-zA-Z0-9_]{1,50}$/;

	export const sendEmailBody = t.Object({
		from: t.String({
			pattern: emailPattern.source,
			description: "Sender email address",
			examples: ["user@example.com", "Your Name <user@example.com>"],
		}),
		to: t.Union([t.String(), t.Array(t.String(), { maxItems: 50 })], {
			description: "Recipient email address(es) (max 50)",
			examples: [
				"recipient@example.com",
				["user1@example.com", "user2@example.com"],
			],
		}),
		subject: t.String({
			minLength: 1,
			maxLength: 255,
			description: "Email subject",
			examples: ["Test Email"],
		}),
		cc: t.Optional(
			t.Union([t.String(), t.Array(t.String(), { maxItems: 50 })], {
				description: "CC email address(es) (max 50)",
				examples: ["cc@example.com"],
			}),
		),
		bcc: t.Optional(
			t.Union([t.String(), t.Array(t.String(), { maxItems: 50 })], {
				description: "BCC email address(es) (max 50)",
				examples: ["bcc@example.com"],
			}),
		),
		text: t.Optional(
			t.String({
				description: "Plain text content",
				examples: ["This is a test email"],
			}),
		),
		html: t.Optional(
			t.String({
				description: "HTML content",
				examples: [
					"<h1>Test Email</h1><p>This is a test email</p>",
					"If not provided, the HTML will be used to generate a plain text version. You can opt out of this behavior by setting value to an empty string.",
				],
			}),
		),
		reply_to: t.Optional(
			t.Union([t.String(), t.Array(t.String())], {
				description: "Reply-to email address",
				examples: ["noreply@example.com"],
			}),
		),
		scheduled_at: t.Optional(
			t.String({
				format: "date-time",
				description: "Schedule email to be sent later (ISO 8601)",
				examples: ["2026-08-05T11:52:01.858Z"],
			}),
		),
		headers: t.Optional(
			t.Record(t.String(), t.String(), {
				description: "Custom headers to add to the email",
			}),
		),
		channel_id: t.Optional(
			t.String({
				description: "The channel ID to receive the email",
			}),
		),
		attachments: t.Optional(
			t.Array(
				t.Object({
					content: t.Optional(t.Union([t.String(), t.Unknown()])),
					filename: t.Optional(t.String()),
					path: t.Optional(t.String()),
					content_type: t.Optional(t.String()),
					content_id: t.Optional(t.String()),
				}),
				{ description: "Email attachments" },
			),
		),
		tags: t.Optional(
			t.Array(
				t.Object({
					name: t.String({
						pattern: tagPattern.source,
						maxLength: 256,
						description: "The name of the email tag.",
						error:
							"The name of the email tag. It can only contain ASCII letters (a-z, A-Z), numbers (0-9), underscores (_), or dashes (-). It can contain no more than 256 characters.",
					}),
					value: t.String({
						pattern: tagPattern.source,
						maxLength: 256,
						description: "The value of the email tag.",
						error:
							"The value of the email tag. It can only contain ASCII letters (a-z, A-Z), numbers (0-9), underscores (_), or dashes (-). It can contain no more than 256 characters.",
					}),
				}),
				{ description: "Custom tags passed in key/value pairs" },
			),
		),
		template: t.Optional(
			t.Object(
				{
					id: t.String({ description: "Template ID" }),
					variables: t.Optional(
						t.Record(
							t.String({
								pattern: variableKeyPattern.source,
								maxLength: 50,
								description: "The key of the variable.",
								error:
									"Variable key may only contain ASCII letters, numbers, and underscores, cannot be more than 50 characters, and cannot be a reserved name (FIRST_NAME, LAST_NAME, EMAIL, UNSUBSCRIBE_URL).",
							}),
							t.Union(
								[
									t.String({
										maxLength: 2000,
										description: "The value of the variable (string).",
									}),
									t.Number({
										maximum: Number.MAX_SAFE_INTEGER,
										description: "The value of the variable (number).",
									}),
								],
								{
									description: "The value of the variable.",
									error:
										"Variable value must be a string (max 2,000 characters) or a number (not greater than 2^53 - 1).",
								},
							),
							{ description: "Variables to replace in the template" },
						),
					),
				},
				{ description: "Email template to use" },
			),
		),
		thread_id: t.Optional(
			t.String({
				description:
					"Thread ID to link this email to an existing conversation thread",
				examples: ["thr_abc123xyz"],
			}),
		),
	});

	export type SendEmailBody = typeof sendEmailBody.static;

	export const sendEmailResponse = t.Object({
		success: t.Boolean({
			description: "Whether the email was sent successfully",
		}),
		messageId: t.String({
			description: "Unique message ID",
		}),
		status: t.String({
			description: "Email status",
		}),
		timestamp: t.String({
			description: "Timestamp when email was sent",
		}),
		id: t.String({
			description: "Email log database ID",
		}),
	});

	export type SendEmailResponse = typeof sendEmailResponse.static;

	export const getAttachmentParams = t.Object({
		emailId: t.String({
			description: "The Email ID",
		}),
		id: t.String({
			description: "The Attachment ID",
		}),
	});
	export type GetAttachmentParams = typeof getAttachmentParams.static;

	export const getAttachmentResponse = t.Object({
		object: t.Literal("attachment"),
		id: t.String(),
		filename: t.String(),
		size: t.Number(),
		content_type: t.String(),
		content_disposition: t.String(),
		content_id: t.Optional(t.String()),
		download_url: t.String(),
		expires_at: t.Optional(t.String()),
	});
	export type GetAttachmentResponse = typeof getAttachmentResponse.static;

	export const unauthorized = t.Object({
		message: t.Literal("Authentication required"),
	});
	export type Unauthorized = typeof unauthorized.static;

	export const forbidden = t.Object({
		message: t.Literal("User is not a member of an organization"),
	});
	export type Forbidden = typeof forbidden.static;

	export const badRequest = t.Object({
		message: t.String({
			description: "Error message",
		}),
	});
	export type BadRequest = typeof badRequest.static;

	export const internalServerError = t.Object({
		message: t.String({
			description: "Error message",
		}),
	});
	export type InternalServerError = typeof internalServerError.static;

	export const domainNotFound = t.Object({
		message: t.String({
			description: "Domain not found or not authorized",
		}),
	});
	export type DomainNotFound = typeof domainNotFound.static;

	export const mailboxNotFound = t.Object({
		message: t.String({
			description: "Mailbox not found or not authorized",
		}),
	});

	export const tooManyRequests = t.Object({
		message: t.String({
			description: "Rate limit exceeded",
		}),
		why: t.Optional(
			t.String({
				description: "Which rate limit layer was exceeded",
			}),
		),
		fix: t.Optional(
			t.String({
				description: "How to resolve the rate limit",
			}),
		),
	});
	export type TooManyRequests = typeof tooManyRequests.static;

	// --- Standard response types ---
	export const successResponse = t.Object({
		success: t.Boolean(),
		id: t.Optional(t.String()),
		message: t.Optional(t.String()),
		isRead: t.Optional(t.Boolean()),
		isStarred: t.Optional(t.Boolean()),
		isSpam: t.Optional(t.Boolean()),
		isImportant: t.Optional(t.Boolean()),
		status: t.Optional(t.String()),
		snoozedUntil: t.Optional(t.Union([t.String(), t.Null()])),
		deletedAt: t.Optional(t.Union([t.String(), t.Null(), t.Date()])),
	});

	export const ErrorResponseSchema = t.Object({
		message: t.String(),
		why: t.Optional(t.String()),
		fix: t.Optional(t.String()),
		link: t.Optional(t.String()),
	});

	export const createMailboxResponse = t.Object({
		id: t.String(),
		email: t.String(),
		status: t.String(),
	});

	export const mailboxListItem = t.Object({
		id: t.String(),
		email: t.String(),
		quota: t.String(),
		status: t.String(),
		displayName: t.Union([t.String(), t.Null()]),
		createdAt: t.Union([t.Date(), t.String()]),
	});

	export const mailboxListResponse = t.Array(mailboxListItem);

	export const mailboxDetailResponse = t.Object({
		id: t.String(),
		email: t.String(),
		quota: t.String(),
		status: t.String(),
		displayName: t.Union([t.String(), t.Null()]),
		domainId: t.String(),
		createdAt: t.Union([t.Date(), t.String()]),
		updatedAt: t.Union([t.Date(), t.String()]),
	});

	export const messageAttachmentResponse = t.Object({
		id: t.String(),
		filename: t.String(),
		contentType: t.String(),
		size: t.Number(),
		storagePath: t.String(),
		contentDisposition: t.Union([t.String(), t.Null()]),
		contentId: t.Union([t.String(), t.Null()]),
		createdAt: t.Union([t.Date(), t.String()]),
	});

	export const attachmentItem = t.Object({
		id: t.String(),
		inboundEmailId: t.String(),
		filename: t.String(),
		contentType: t.String(),
		size: t.Number(),
		storagePath: t.String(),
		contentDisposition: t.Union([t.String(), t.Null()]),
		contentId: t.Union([t.String(), t.Null()]),
		createdAt: t.Union([t.Date(), t.String()]),
	});

	export const messageItem = t.Object({
		id: t.String(),
		mailboxId: t.String(),
		organizationId: t.String(),
		fromEmail: t.String(),
		fromName: t.Union([t.String(), t.Null()]),
		toEmails: t.Array(t.String()),
		ccEmails: t.Union([t.Array(t.String()), t.Null(), t.Undefined()]),
		bccEmails: t.Union([t.Array(t.String()), t.Null(), t.Undefined()]),
		replyTo: t.Union([t.String(), t.Null()]),
		subject: t.Union([t.String(), t.Null()]),
		textBody: t.Union([t.String(), t.Null()]),
		htmlBody: t.Union([t.String(), t.Null()]),
		snippet: t.Union([t.String(), t.Null()]),
		size: t.Number(),
		status: t.String(),
		isRead: t.Boolean(),
		isStarred: t.Boolean(),
		isSpam: t.Boolean(),
		spamScore: t.Union([t.Number(), t.Null()]),
		messageId: t.Union([t.String(), t.Null()]),
		threadId: t.Union([t.String(), t.Null()]),
		inReplyTo: t.Union([t.String(), t.Null()]),
		references: t.Union([t.Array(t.String()), t.Null(), t.Undefined()]),
		headers: t.Union([
			t.Record(t.String(), t.String()),
			t.Null(),
			t.Undefined(),
		]),
		date: t.Union([t.Date(), t.String(), t.Null()]),
		createdAt: t.Union([t.Date(), t.String()]),
		attachments: t.Optional(t.Array(attachmentItem)),
	});

	export const messageListResponse = t.Array(messageItem);

	export const messageRawResponse = t.Object({
		id: t.String(),
		messageId: t.Union([t.String(), t.Null()]),
		raw: t.String(),
	});

	export const threadItem = t.Object({
		id: t.String(),
		mailboxId: t.Union([t.String(), t.Null()]),
		organizationId: t.String(),
		subject: t.Union([t.String(), t.Null()]),
		lastMessagePreview: t.Union([t.String(), t.Null()]),
		lastMessageAt: t.Union([t.Date(), t.String()]),
		status: t.String(),
		messageCount: t.Number(),
		participants: t.Array(t.String()),
		isRead: t.Boolean(),
		isStarred: t.Boolean(),
		isImportant: t.Optional(t.Boolean()),
		snoozedUntil: t.Optional(t.Union([t.String(), t.Null(), t.Date()])),
		deletedAt: t.Optional(t.Union([t.String(), t.Null(), t.Date()])),
		createdAt: t.Union([t.Date(), t.String()]),
		updatedAt: t.Union([t.Date(), t.String()]),
	});

	export const labelItem = t.Object({
		id: t.String(),
		mailboxId: t.String(),
		organizationId: t.String(),
		name: t.String(),
		color: t.String(),
		createdAt: t.Union([t.Date(), t.String()]),
		updatedAt: t.Union([t.Date(), t.String()]),
	});

	export const labelListResponse = t.Array(labelItem);

	export const noteItem = t.Object({
		id: t.String(),
		threadId: t.String(),
		organizationId: t.String(),
		content: t.String(),
		color: t.String(),
		isPinned: t.Boolean(),
		order: t.Number(),
		createdAt: t.Union([t.Date(), t.String()]),
		updatedAt: t.Union([t.Date(), t.String()]),
	});

	export const noteListResponse = t.Array(noteItem);

	export const threadListResponse = t.Array(threadItem);

	export const threadMessageEmailInbound = t.Object({
		id: t.String(),
		fromEmail: t.String(),
		toEmails: t.Array(t.String()),
		subject: t.Union([t.String(), t.Null()]),
		textBody: t.Union([t.String(), t.Null()]),
		htmlBody: t.Union([t.String(), t.Null()]),
		isRead: t.Boolean(),
		isStarred: t.Boolean(),
		attachments: t.Array(attachmentItem),
		createdAt: t.Union([t.Date(), t.String()]),
	});

	export const threadMessageEmailOutbound = t.Object({
		id: t.String(),
		fromEmail: t.String(),
		fromName: t.Union([t.String(), t.Null()]),
		toEmails: t.Array(t.String()),
		ccEmails: t.Union([t.Array(t.String()), t.Null(), t.Undefined()]),
		subject: t.Union([t.String(), t.Null()]),
		textBody: t.Union([t.String(), t.Null()]),
		htmlBody: t.Union([t.String(), t.Null()]),
		status: t.String(),
		sentAt: t.Union([t.Date(), t.String(), t.Null()]),
		createdAt: t.Union([t.Date(), t.String()]),
	});

	export const threadMessageItem = t.Object({
		id: t.String(),
		threadId: t.String(),
		direction: t.String(),
		inboundEmailId: t.Union([t.String(), t.Null()]),
		emailLogId: t.Union([t.String(), t.Null()]),
		fromEmail: t.String(),
		fromName: t.Union([t.String(), t.Null()]),
		subject: t.Union([t.String(), t.Null()]),
		preview: t.Union([t.String(), t.Null()]),
		messageAt: t.Union([t.Date(), t.String()]),
		rfc822MessageId: t.Union([t.String(), t.Null()]),
		inReplyTo: t.Union([t.String(), t.Null()]),
		createdAt: t.Union([t.Date(), t.String()]),
		email: t.Union([
			threadMessageEmailInbound,
			threadMessageEmailOutbound,
			t.Null(),
		]),
	});

	export const threadDetailResponse = t.Object({
		id: t.String(),
		mailboxId: t.Union([t.String(), t.Null()]),
		organizationId: t.String(),
		subject: t.Union([t.String(), t.Null()]),
		lastMessagePreview: t.Union([t.String(), t.Null()]),
		lastMessageAt: t.Union([t.Date(), t.String()]),
		status: t.String(),
		messageCount: t.Number(),
		participants: t.Array(t.String()),
		isRead: t.Boolean(),
		isStarred: t.Boolean(),
		createdAt: t.Union([t.Date(), t.String()]),
		updatedAt: t.Union([t.Date(), t.String()]),
		messages: t.Array(threadMessageItem),
	});
}
