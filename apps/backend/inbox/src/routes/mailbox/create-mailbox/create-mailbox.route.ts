import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { createMailboxController } from "./create-mailbox.controllers";

export const createMailboxRoute = new Elysia().use(authMiddleware).post(
	"/create",
	async ({ body, organizationId }) => {
		return createMailboxController({
			...body,
			organizationId,
		});
	},
	{
		auth: true,
		body: t.Object({
			domainId: t.String({ description: "Associated verified Domain ID" }),
			email: t.String({ description: "Full email address for the mailbox" }),
			password: t.Optional(t.String({ description: "Mailbox password" })),
			quota: t.Optional(
				t.String({ description: "Storage quota, defaults to 5 GB" }),
			),
			displayName: t.Optional(
				t.String({ description: "Friendly name of the mailbox sender" }),
			),
		}),
		response: {
			200: MailModel.createMailboxResponse,
			400: MailModel.ErrorResponseSchema,
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			409: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Mailboxes"],
			summary: "Create Mailbox",
			description:
				"Register a new email mailbox for the active organization under a verified domain",
		},
	},
);
