import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
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

export const messagesRoute = new Elysia({ prefix: "/v1/messages" })
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
				mailboxId: t.Optional(t.String()),
			}),
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
				id: t.String(),
			}),
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
				ids: t.Array(t.String(), { maxItems: 100 }),
			}),
		},
	)

	// ── Get attachment ───────────────────────────────────────────
	.get(
		"/:messageId/attachments/:attachmentId",
		async ({ params: { messageId, attachmentId }, organizationId }) => {
			return getMessageAttachmentController(
				messageId,
				attachmentId,
				organizationId,
			);
		},
		{
			auth: true,
			params: t.Object({
				messageId: t.String(),
				attachmentId: t.String(),
			}),
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
				id: t.String(),
			}),
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
				id: t.String(),
			}),
			body: t.Object({
				isRead: t.Optional(t.Boolean()),
				isStarred: t.Optional(t.Boolean()),
			}),
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
				id: t.String(),
			}),
			body: t.Object({
				isRead: t.Boolean(),
			}),
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
				id: t.String(),
			}),
			body: t.Object({
				isStarred: t.Boolean(),
			}),
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
				id: t.String(),
			}),
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
				mailboxId: t.String(),
				to: t.Union([t.String(), t.Array(t.String())]),
				subject: t.String(),
				text: t.Optional(t.String()),
				html: t.Optional(t.String()),
				cc: t.Optional(t.Union([t.String(), t.Array(t.String())])),
				bcc: t.Optional(t.Union([t.String(), t.Array(t.String())])),
			}),
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
				id: t.String(),
			}),
			body: t.Object({
				text: t.Optional(t.String()),
				html: t.Optional(t.String()),
				cc: t.Optional(t.Union([t.String(), t.Array(t.String())])),
				bcc: t.Optional(t.Union([t.String(), t.Array(t.String())])),
			}),
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
				id: t.String(),
			}),
			body: t.Object({
				text: t.Optional(t.String()),
				html: t.Optional(t.String()),
				bcc: t.Optional(t.Union([t.String(), t.Array(t.String())])),
			}),
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
				id: t.String(),
			}),
			body: t.Object({
				to: t.Union([t.String(), t.Array(t.String())]),
				text: t.Optional(t.String()),
				html: t.Optional(t.String()),
				cc: t.Optional(t.Union([t.String(), t.Array(t.String())])),
				bcc: t.Optional(t.Union([t.String(), t.Array(t.String())])),
			}),
		},
	);
