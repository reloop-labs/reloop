import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
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

export const threadsRoute = new Elysia({ prefix: "/v1/threads" })
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
				mailboxId: t.Optional(t.String()),
				limit: t.Optional(t.String()),
				offset: t.Optional(t.String()),
			}),
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
				id: t.String(),
			}),
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
				id: t.String(),
				attachmentId: t.String(),
			}),
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
				id: t.String(),
			}),
			body: t.Object({
				isRead: t.Optional(t.Boolean()),
				isStarred: t.Optional(t.Boolean()),
				status: t.Optional(
					t.Union([
						t.Literal("active"),
						t.Literal("archived"),
						t.Literal("closed"),
					]),
				),
			}),
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
				id: t.String(),
			}),
			body: t.Object({
				isRead: t.Boolean(),
			}),
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
				id: t.String(),
			}),
			body: t.Object({
				isStarred: t.Boolean(),
			}),
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
				id: t.String(),
			}),
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
				id: t.String(),
			}),
		},
	);
