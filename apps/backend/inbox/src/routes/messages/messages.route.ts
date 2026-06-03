import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { Elysia, t } from "elysia";
import { evlog } from "evlog/elysia";
import {
	deleteMessageController,
	getMessageController,
	getMessagesController,
	markMessageReadController,
	toggleStarController,
} from "./messages.controllers";

export const messagesRoute = new Elysia({ prefix: "/v1/messages" })
	.use(evlog())
	.use(authMiddleware)
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
	);
