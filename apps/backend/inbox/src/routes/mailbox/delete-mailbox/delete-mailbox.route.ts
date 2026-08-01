import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { deleteMailboxXCodeSamples } from "@reloop/code-samples/inbox";
import { Elysia, t } from "elysia";
import { deleteMailboxController } from "./delete-mailbox.controllers";

export const deleteMailboxRoute = new Elysia().use(authMiddleware).delete(
	"/:id",
	async ({ params: { id }, organizationId }) => {
		return deleteMailboxController(id, organizationId);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Mailbox ID" }),
		}),
		response: {
			200: MailModel.successResponse,
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			404: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Mailboxes"],
			summary: "Delete Mailbox",
			description: "Permanently delete a mailbox and its associated emails",
			"x-codeSamples": deleteMailboxXCodeSamples,
		},
	},
);
