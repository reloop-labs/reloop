import { Elysia, t } from "elysia";
import { evlog } from "evlog/elysia";
import { authMiddleware } from "../../middleware/auth";
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
		async ({ query, activeOrganizationId }) => {
			return getMessagesController(activeOrganizationId, query.mailboxId);
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
		async ({ params: { id }, activeOrganizationId }) => {
			return getMessageController(id, activeOrganizationId);
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
		async ({ params: { id }, body, activeOrganizationId }) => {
			return markMessageReadController(id, activeOrganizationId, body.isRead);
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
		async ({ params: { id }, body, activeOrganizationId }) => {
			return toggleStarController(id, activeOrganizationId, body.isStarred);
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
		async ({ params: { id }, activeOrganizationId }) => {
			return deleteMessageController(id, activeOrganizationId);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String(),
			}),
		},
	);
