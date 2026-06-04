import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { evlog } from "evlog/elysia";
import {
	archiveThreadController,
	deleteThreadController,
	getThreadAttachmentController,
	getThreadController,
	getThreadsController,
	markThreadReadController,
	toggleThreadStarController,
	updateThreadController,
} from "./threads.controllers";

export const threadsRoute = new Elysia({ prefix: "/v1/threads", name: "ThreadsRoute" })
	.use(evlog())
	.use(authMiddleware)
	.get(
		"/",
		async ({ query, organizationId }) => {
			return getThreadsController(
				organizationId,
				query.mailboxId,
				query.limit ? Number(query.limit) : 50,
				query.offset ? Number(query.offset) : 0,
			);
		},
		{
			auth: true,
			query: t.Object({
				mailboxId: t.Optional(t.String({ description: "Filter threads by mailbox ID" })),
				limit: t.Optional(t.String({ description: "Number of threads to retrieve (default: 50)" })),
				offset: t.Optional(t.String({ description: "Pagination offset" })),
			}),
			response: {
				200: MailModel.threadListResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Threads"],
				summary: "List Threads",
				description: "Retrieve email conversation threads for the organization",
			},
		},
	)
	.get(
		"/:id",
		async ({ params: { id }, organizationId }) => {
			return getThreadController(id, organizationId);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Thread ID" }),
			}),
			response: {
				200: MailModel.threadDetailResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Threads"],
				summary: "Get Thread",
				description: "Retrieve a single thread with all its conversation messages",
			},
		},
	)
	.get(
		"/:id/attachments/:attachmentId",
		async ({ params: { id, attachmentId }, organizationId }) => {
			return getThreadAttachmentController(
				id,
				attachmentId,
				organizationId,
			);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Thread ID" }),
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
				tags: ["Threads"],
				summary: "Get Thread Attachment",
				description: "Retrieve attachment details from a thread conversation",
			},
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, organizationId }) => {
			return updateThreadController(id, organizationId, body);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Thread ID" }),
			}),
			body: t.Object({
				isRead: t.Optional(t.Boolean({ description: "Read status of the thread" })),
				isStarred: t.Optional(t.Boolean({ description: "Starred status of the thread" })),
				status: t.Optional(
					t.Union([
						t.Literal("active"),
						t.Literal("archived"),
						t.Literal("closed"),
					], { description: "State status of the thread" }),
				),
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
				tags: ["Threads"],
				summary: "Update Thread",
				description: "Update status, read, or starred properties of a thread",
			},
		},
	)
	.patch(
		"/:id/read",
		async ({ params: { id }, body, organizationId }) => {
			return markThreadReadController(id, organizationId, body.isRead);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Thread ID" }),
			}),
			body: t.Object({
				isRead: t.Boolean({ description: "Whether to mark the thread as read" }),
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
				tags: ["Threads"],
				summary: "Mark Thread Read",
				description: "Direct endpoint to mark a conversation thread as read or unread",
			},
		},
	)
	.patch(
		"/:id/star",
		async ({ params: { id }, body, organizationId }) => {
			return toggleThreadStarController(id, organizationId, body.isStarred);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Thread ID" }),
			}),
			body: t.Object({
				isStarred: t.Boolean({ description: "Whether to star the thread" }),
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
				tags: ["Threads"],
				summary: "Toggle Thread Star",
				description: "Direct endpoint to star or unstar a conversation thread",
			},
		},
	)
	.patch(
		"/:id/archive",
		async ({ params: { id }, organizationId }) => {
			return archiveThreadController(id, organizationId);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Thread ID" }),
			}),
			response: {
				200: MailModel.successResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Threads"],
				summary: "Archive Thread",
				description: "Direct endpoint to archive a conversation thread",
			},
		},
	)
	.delete(
		"/:id",
		async ({ params: { id }, organizationId }) => {
			return deleteThreadController(id, organizationId);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Thread ID" }),
			}),
			response: {
				200: MailModel.successResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Threads"],
				summary: "Delete Thread",
				description: "Permanently delete a thread and all associated messages",
			},
		},
	);
