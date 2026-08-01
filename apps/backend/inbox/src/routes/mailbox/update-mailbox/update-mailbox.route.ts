import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { updateMailboxXCodeSamples } from "@reloop/code-samples/inbox";
import { Elysia, t } from "elysia";
import { updateMailboxController } from "./update-mailbox.controllers";

export const updateMailboxRoute = new Elysia().use(authMiddleware).patch(
	"/:id",
	async ({ params: { id }, body, organizationId }) => {
		return updateMailboxController(id, organizationId, body);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Mailbox ID" }),
		}),
		body: t.Object({
			displayName: t.Optional(
				t.String({ description: "Friendly name of the mailbox sender" }),
			),
			status: t.Optional(
				t.Union([t.Literal("active"), t.Literal("disabled")], {
					description: "Mailbox status",
				}),
			),
			quota: t.Optional(t.String({ description: "Storage quota limit" })),
		}),
		response: {
			200: MailModel.successResponse,
			400: MailModel.ErrorResponseSchema,
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			404: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Mailboxes"],
			summary: "Update Mailbox",
			description: "Update settings or status of an existing mailbox",
			"x-codeSamples": updateMailboxXCodeSamples,
		},
	},
);
