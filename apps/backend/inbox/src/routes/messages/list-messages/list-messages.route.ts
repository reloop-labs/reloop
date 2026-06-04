import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { getMessagesController } from "./list-messages.controllers";

export const listMessagesRoute = new Elysia().use(authMiddleware).get(
	"/",
	async ({ query, organizationId }) => {
		return getMessagesController(organizationId, query.mailboxId);
	},
	{
		auth: true,
		query: t.Object({
			mailboxId: t.Optional(
				t.String({ description: "Filter messages by mailbox ID" }),
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
