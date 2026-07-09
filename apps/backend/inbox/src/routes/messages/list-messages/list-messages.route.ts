import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { getMessagesController } from "./list-messages.controllers";

export const listMessagesRoute = new Elysia().use(authMiddleware).get(
	"/",
	async ({ query, organizationId }) => {
		return getMessagesController(
			organizationId,
			query.mailboxId,
			query.limit,
			query.offset,
			query.q,
			query.isSpam,
		);
	},
	{
		auth: true,
		query: t.Object({
			mailboxId: t.Optional(
				t.String({ description: "Filter messages by mailbox ID" }),
			),
			limit: t.Optional(t.Numeric({ default: 100, maximum: 200 })),
			offset: t.Optional(t.Numeric({ default: 0 })),
			q: t.Optional(t.String({ description: "Search subject, snippet, sender" })),
			isSpam: t.Optional(
				t.Boolean({ description: "Filter by spam status" }),
			),
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
);
