import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia } from "elysia";
import { getMailboxesController } from "./list-mailboxes.controllers";

export const listMailboxesRoute = new Elysia().use(authMiddleware).get(
	"/list",
	async ({ organizationId }) => {
		return getMailboxesController(organizationId);
	},
	{
		auth: true,
		response: {
			200: MailModel.mailboxListResponse,
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Mailboxes"],
			summary: "List Mailboxes",
			description:
				"Retrieve all mailboxes associated with the active organization",
		},
	},
);
