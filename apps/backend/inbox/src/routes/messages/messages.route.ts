import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { evlog } from "evlog/elysia";
import {
	batchGetMessagesController,
	deleteMessageController,
	forwardMessageController,
	getMessageAttachmentController,
	getMessageController,
	getMessagesController,
	getRawMessageController,
	markMessageReadController,
	replyAllToMessageController,
	replyToMessageController,
	sendMessageController,
	toggleStarController,
	updateMessageController,
} from "./messages.controllers";

export const messagesRoute = new Elysia({ prefix: "/v1/messages", name: "MessagesRoute" })
	.use(evlog())
	.use(authMiddleware)

	// ── List messages ────────────────────────────────────────────
	.get(
		"/",
		async ({ query, organizationId }) => {
			return getMessagesController(organizationId, query.mailboxId);
		},
		{
			auth: true,
			query: t.Object({
				mailboxId: t.Optional(t.String({ description: "Filter messages by mailbox ID" })),
			}),
			response: {
				200: MailModel.messageListResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "List Messages",
				description: "Retrieve inbox emails for the active organization",
			},
		},
	)

	// ── Get single message ───────────────────────────────────────
	.get(
		"/:id",
		async ({ params: { id }, organizationId }) => {
			return getMessageController(id, organizationId);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Message ID" }),
			}),
			response: {
				200: MailModel.messageItem,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "Get Message",
				description: "Retrieve details of a single email message by ID",
			},
		},
	)

	// ── Batch get messages ───────────────────────────────────────
	.post(
		"/batch",
		async ({ body, organizationId }) => {
			return batchGetMessagesController(organizationId, body.ids);
		},
		{
			auth: true,
			body: t.Object({
				ids: t.Array(t.String({ description: "Message ID" }), { maxItems: 100 }),
			}),
			response: {
				200: MailModel.messageListResponse,
				400: MailModel.ErrorResponseSchema,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "Batch Get Messages",
				description: "Retrieve multiple email messages by their IDs (max 100)",
			},
		},
	)

	// ── Get attachment ───────────────────────────────────────────
	.get(
		"/:id/attachments/:attachmentId",
		async ({ params: { id, attachmentId }, organizationId }) => {
			return getMessageAttachmentController(
				id,
				attachmentId,
				organizationId,
			);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Message ID" }),
				attachmentId: t.String({ description: "Attachment ID" }),
			}),
			response: {
				200: MailModel.messageAttachmentResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "Get Message Attachment",
				description: "Retrieve information and storage details of a specific message attachment",
			},
		},
	)

	// ── Get raw RFC822 message ───────────────────────────────────
	.get(
		"/:id/raw",
		async ({ params: { id }, organizationId }) => {
			return getRawMessageController(id, organizationId);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Message ID" }),
			}),
			response: {
				200: MailModel.messageRawResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "Get Raw Message",
				description: "Retrieve the raw, RFC822 formatted string content of a message",
			},
		},
	)

	// ── Update message (unified) ─────────────────────────────────
	.patch(
		"/:id",
		async ({ params: { id }, body, organizationId }) => {
			return updateMessageController(id, organizationId, body);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Message ID" }),
			}),
			body: t.Object({
				isRead: t.Optional(t.Boolean({ description: "Read status of the message" })),
				isStarred: t.Optional(t.Boolean({ description: "Starred status of the message" })),
			}),
			response: {
				200: MailModel.successResponse,
				400: MailModel.ErrorResponseSchema,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "Update Message Status",
				description: "Update status attributes (isRead, isStarred) of a message",
			},
		},
	)

	// ── Mark read (backward compat) ──────────────────────────────
	.patch(
		"/:id/read",
		async ({ params: { id }, body, organizationId }) => {
			return markMessageReadController(id, organizationId, body.isRead);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Message ID" }),
			}),
			body: t.Object({
				isRead: t.Boolean({ description: "Whether to mark the message as read" }),
			}),
			response: {
				200: MailModel.successResponse,
				400: MailModel.ErrorResponseSchema,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "Mark Message Read",
				description: "Direct endpoint to update read/unread status of a message",
			},
		},
	)

	// ── Toggle star (backward compat) ────────────────────────────
	.patch(
		"/:id/star",
		async ({ params: { id }, body, organizationId }) => {
			return toggleStarController(id, organizationId, body.isStarred);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Message ID" }),
			}),
			body: t.Object({
				isStarred: t.Boolean({ description: "Whether to star the message" }),
			}),
			response: {
				200: MailModel.successResponse,
				400: MailModel.ErrorResponseSchema,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "Toggle Message Star",
				description: "Direct endpoint to toggle starred status of a message",
			},
		},
	)

	// ── Delete message ───────────────────────────────────────────
	.delete(
		"/:id",
		async ({ params: { id }, organizationId }) => {
			return deleteMessageController(id, organizationId);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Message ID" }),
			}),
			response: {
				200: MailModel.successResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "Delete Message",
				description: "Permanently delete an email message",
			},
		},
	)

	// ── Send new message ─────────────────────────────────────────
	.post(
		"/send",
		async ({ body, organizationId, request }) => {
			return sendMessageController(
				organizationId,
				body,
				request.headers.get("x-api-key") ?? "",
			);
		},
		{
			auth: true,
			body: t.Object({
				mailboxId: t.String({ description: "Sender Mailbox ID" }),
				to: t.Union([t.String(), t.Array(t.String())], { description: "Recipient email address(es)" }),
				subject: t.String({ description: "Email subject" }),
				text: t.Optional(t.String({ description: "Plain text body content" })),
				html: t.Optional(t.String({ description: "HTML body content" })),
				cc: t.Optional(t.Union([t.String(), t.Array(t.String())], { description: "CC recipient address(es)" })),
				bcc: t.Optional(t.Union([t.String(), t.Array(t.String())], { description: "BCC recipient address(es)" })),
			}),
			response: {
				200: MailModel.sendEmailResponse,
				400: MailModel.ErrorResponseSchema,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "Send Email",
				description: "Send a new email message on behalf of a mailbox",
			},
		},
	)

	// ── Reply to message ─────────────────────────────────────────
	.post(
		"/:id/reply",
		async ({ params: { id }, body, organizationId, request }) => {
			return replyToMessageController(
				id,
				organizationId,
				body,
				request.headers.get("x-api-key") ?? "",
			);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Message ID to reply to" }),
			}),
			body: t.Object({
				text: t.Optional(t.String({ description: "Plain text body content" })),
				html: t.Optional(t.String({ description: "HTML body content" })),
				cc: t.Optional(t.Union([t.String(), t.Array(t.String())], { description: "CC recipient address(es)" })),
				bcc: t.Optional(t.Union([t.String(), t.Array(t.String())], { description: "BCC recipient address(es)" })),
			}),
			response: {
				200: MailModel.sendEmailResponse,
				400: MailModel.ErrorResponseSchema,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "Reply to Message",
				description: "Reply to an email message, preserving thread context and header references",
			},
		},
	)

	// ── Reply all ────────────────────────────────────────────────
	.post(
		"/:id/reply-all",
		async ({ params: { id }, body, organizationId, request }) => {
			return replyAllToMessageController(
				id,
				organizationId,
				body,
				request.headers.get("x-api-key") ?? "",
			);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Message ID to reply all to" }),
			}),
			body: t.Object({
				text: t.Optional(t.String({ description: "Plain text body content" })),
				html: t.Optional(t.String({ description: "HTML body content" })),
				bcc: t.Optional(t.Union([t.String(), t.Array(t.String())], { description: "BCC recipient address(es)" })),
			}),
			response: {
				200: MailModel.sendEmailResponse,
				400: MailModel.ErrorResponseSchema,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "Reply All to Message",
				description: "Reply all to an email message, copying all original recipients",
			},
		},
	)

	// ── Forward message ──────────────────────────────────────────
	.post(
		"/:id/forward",
		async ({ params: { id }, body, organizationId, request }) => {
			return forwardMessageController(
				id,
				organizationId,
				body,
				request.headers.get("x-api-key") ?? "",
			);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Message ID to forward" }),
			}),
			body: t.Object({
				to: t.Union([t.String(), t.Array(t.String())], { description: "Recipient address(es) to forward to" }),
				text: t.Optional(t.String({ description: "Plain text context notes to prepend" })),
				html: t.Optional(t.String({ description: "HTML context notes to prepend" })),
				cc: t.Optional(t.Union([t.String(), t.Array(t.String())], { description: "CC recipient address(es)" })),
				bcc: t.Optional(t.Union([t.String(), t.Array(t.String())], { description: "BCC recipient address(es)" })),
			}),
			response: {
				200: MailModel.sendEmailResponse,
				400: MailModel.ErrorResponseSchema,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "Forward Message",
				description: "Forward an email message, prepending headers and custom comments",
			},
		},
	);
