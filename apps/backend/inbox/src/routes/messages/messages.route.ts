import { Elysia, t } from "elysia";
import {
	getMessagesController,
	getMessageController,
	deleteMessageController,
} from "./messages.controllers";
import { evlog } from "evlog/elysia";

export const messagesRoute = new Elysia({ prefix: "/v1/messages" })
	.use(evlog())
	.get(
		"/",
		async ({ query, headers }) => {
			const orgId = headers["x-organization-id"] || "org_123";
			return getMessagesController(orgId, query.mailboxId);
		},
		{
			query: t.Object({
				mailboxId: t.Optional(t.String()),
			}),
		}
	)
	.get(
		"/:id",
		async ({ params: { id }, headers }) => {
			const orgId = headers["x-organization-id"] || "org_123";
			return getMessageController(id, orgId);
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	)
	.delete(
		"/:id",
		async ({ params: { id }, headers }) => {
			const orgId = headers["x-organization-id"] || "org_123";
			return deleteMessageController(id, orgId);
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	);
