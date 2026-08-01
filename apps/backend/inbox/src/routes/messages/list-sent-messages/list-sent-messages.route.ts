import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { listSentMessagesXCodeSamples } from "@reloop/code-samples/inbox";
import { Elysia, t } from "elysia";
import { getSentMessagesController } from "./list-sent-messages.controllers";

export const listSentMessagesRoute = new Elysia().use(authMiddleware).get(
	"/sent",
	async ({ query, organizationId }) => {
		return getSentMessagesController(organizationId, query.mailboxId);
	},
	{
		auth: true,
		query: t.Object({
			mailboxId: t.Optional(
				t.String({ description: "Filter sent messages by mailbox ID" }),
			),
		}),
		response: {
			200: t.Array(
				t.Object({
					id: t.String(),
					messageId: t.String(),
					organizationId: t.String(),
					domainId: t.String(),
					fromEmail: t.String(),
					fromName: t.Union([t.String(), t.Null()]),
					toEmails: t.Array(t.String()),
					ccEmails: t.Union([t.Array(t.String()), t.Null(), t.Undefined()]),
					bccEmails: t.Union([t.Array(t.String()), t.Null(), t.Undefined()]),
					subject: t.String(),
					textBody: t.Union([t.String(), t.Null()]),
					htmlBody: t.Union([t.String(), t.Null()]),
					status: t.String(),
					createdAt: t.Union([t.Date(), t.String()]),
				}),
			),
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Messages"],
			summary: "List Sent Messages",
			description:
				"Retrieve sent emails (outbound logs) for the active organization",
			"x-codeSamples": listSentMessagesXCodeSamples,
		},
	},
);
