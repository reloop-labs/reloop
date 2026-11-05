import { forwardToService, ServiceError } from "@be/agent/lib/client";
import { getDomainSchemas } from "@be/agent/lib/schema-registry";
import { authMiddleware } from "@be/agent/middleware/auth";
import { Elysia, t } from "elysia";

export const inboxRoutes = new Elysia({ prefix: "/inbox" })
	.use(authMiddleware)
	.get(
		"/schema",
		() => ({
			domain: "inbox",
			endpoints: getDomainSchemas("inbox"),
		}),
		{
			detail: {
				summary: "Inbox Domain Schemas",
				description:
					"Returns the available inbox, thread & message schemas for AI agents.",
				tags: ["Inbox"],
			},
		},
	)
	.get(
		"/mailboxes",
		async ({ set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "inbox",
					path: "/api/inbox/v1/mailboxes",
					method: "GET",
					userId,
					organizationId,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			detail: {
				summary: "List Mailboxes",
				description: "Lists incoming mailboxes for the workspace.",
				tags: ["Inbox"],
			},
		},
	)
	.get(
		"/threads",
		async ({ query, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "inbox",
					path: "/api/inbox/v1/threads",
					method: "GET",
					userId,
					organizationId,
					query,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			query: t.Optional(
				t.Object({
					page: t.Optional(t.Numeric()),
					limit: t.Optional(t.Numeric()),
					mailboxId: t.Optional(t.String()),
				}),
			),
			detail: {
				summary: "List Threads",
				description: "Retrieves incoming conversation threads.",
				tags: ["Inbox"],
			},
		},
	)
	.get(
		"/threads/:id",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "inbox",
					path: `/api/inbox/v1/threads/${params.id}`,
					method: "GET",
					userId,
					organizationId,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			params: t.Object({ id: t.String() }),
			detail: {
				summary: "Get Thread",
				description: "Retrieves conversation messages in an email thread.",
				tags: ["Inbox"],
			},
		},
	)
	.patch(
		"/threads/:id",
		async ({ params, body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "inbox",
					path: `/api/inbox/v1/threads/${params.id}`,
					method: "PATCH",
					userId,
					organizationId,
					body,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			params: t.Object({ id: t.String() }),
			body: t.Object({
				isRead: t.Optional(t.Boolean()),
				isArchived: t.Optional(t.Boolean()),
				isStarred: t.Optional(t.Boolean()),
			}),
			detail: {
				summary: "Update Thread",
				description: "Updates thread state (read/unread, archived, starred).",
				tags: ["Inbox"],
			},
		},
	)
	.delete(
		"/threads/:id",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "inbox",
					path: `/api/inbox/v1/threads/${params.id}`,
					method: "DELETE",
					userId,
					organizationId,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			params: t.Object({ id: t.String() }),
			detail: {
				summary: "Delete Thread",
				description: "Permanently deletes an email thread.",
				tags: ["Inbox"],
			},
		},
	)
	.get(
		"/messages",
		async ({ query, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "inbox",
					path: "/api/inbox/v1/messages",
					method: "GET",
					userId,
					organizationId,
					query,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			query: t.Optional(
				t.Object({
					page: t.Optional(t.Numeric()),
					limit: t.Optional(t.Numeric()),
					mailboxId: t.Optional(t.String()),
				}),
			),
			detail: {
				summary: "List Messages",
				description: "Retrieves incoming messages across all mailboxes.",
				tags: ["Inbox"],
			},
		},
	)
	.get(
		"/messages/:id",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "inbox",
					path: `/api/inbox/v1/messages/${params.id}`,
					method: "GET",
					userId,
					organizationId,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			params: t.Object({ id: t.String() }),
			detail: {
				summary: "Get Message",
				description: "Retrieves parsed message content and attachments.",
				tags: ["Inbox"],
			},
		},
	)
	.post(
		"/messages/send",
		async ({ body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "inbox",
					path: "/api/inbox/v1/messages/send",
					method: "POST",
					userId,
					organizationId,
					body,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			body: t.Object({
				mailboxId: t.String(),
				to: t.Union([t.String(), t.Array(t.String())]),
				subject: t.String(),
				body: t.String(),
			}),
			detail: {
				summary: "Send Inbox Message",
				description: "Sends an email from an inbox address.",
				tags: ["Inbox"],
			},
		},
	)
	.post(
		"/messages/:id/reply",
		async ({ params, body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "inbox",
					path: `/api/inbox/v1/messages/${params.id}/reply`,
					method: "POST",
					userId,
					organizationId,
					body,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			params: t.Object({ id: t.String() }),
			body: t.Object({
				body: t.String(),
			}),
			detail: {
				summary: "Reply to Message",
				description:
					"Sends a direct reply to an incoming message in thread context.",
				tags: ["Inbox"],
			},
		},
	)
	.post(
		"/messages/:id/forward",
		async ({ params, body, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "inbox",
					path: `/api/inbox/v1/messages/${params.id}/forward`,
					method: "POST",
					userId,
					organizationId,
					body,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			params: t.Object({ id: t.String() }),
			body: t.Object({
				to: t.Union([t.String(), t.Array(t.String())]),
				comment: t.Optional(t.String()),
			}),
			detail: {
				summary: "Forward Message",
				description: "Forwards an incoming message to new recipients.",
				tags: ["Inbox"],
			},
		},
	)
	.delete(
		"/messages/:id",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "inbox",
					path: `/api/inbox/v1/messages/${params.id}`,
					method: "DELETE",
					userId,
					organizationId,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			params: t.Object({ id: t.String() }),
			detail: {
				summary: "Delete Message",
				description: "Deletes an individual email message.",
				tags: ["Inbox"],
			},
		},
	)
	.delete(
		"/pending/:id",
		async ({ params, set, userId, organizationId }) => {
			try {
				const response = await forwardToService({
					service: "inbox",
					path: `/api/inbox/v1/messages/pending/${params.id}`,
					method: "DELETE",
					userId,
					organizationId,
				});
				return { success: true, data: response };
			} catch (err) {
				if (err instanceof ServiceError) {
					set.status = err.status;
					return {
						code: err.code,
						message: err.message,
						why: err.why,
						fix: err.fix,
					};
				}
				throw err;
			}
		},
		{
			authAgent: true,
			params: t.Object({ id: t.String() }),
			detail: {
				summary: "Cancel Pending Message",
				description: "Cancels a scheduled or pending outbound message.",
				tags: ["Inbox"],
			},
		},
	);
