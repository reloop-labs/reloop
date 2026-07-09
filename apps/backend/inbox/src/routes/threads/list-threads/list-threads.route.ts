import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { getThreadsController } from "./list-threads.controllers";

export const listThreadsRoute = new Elysia().use(authMiddleware).get(
	"/",
	async ({ query, organizationId }) => {
		return getThreadsController(
			organizationId,
			query.mailboxId,
			query.limit,
			query.offset,
			query.folder,
			query.q,
		);
	},
	{
		auth: true,
		query: t.Object({
			mailboxId: t.Optional(
				t.String({ description: "Filter threads by mailbox ID" }),
			),
			limit: t.Optional(t.Numeric({ default: 50, maximum: 200 })),
			offset: t.Optional(t.Numeric({ default: 0 })),
			folder: t.Optional(
				t.String({
					description:
						"Filter by folder: inbox, archive, trash, snoozed (omit for all)",
				}),
			),
			q: t.Optional(t.String({ description: "Search subject and preview" })),
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
			description:
				"Retrieve email conversations (threads) for the active organization",
		},
	},
);
