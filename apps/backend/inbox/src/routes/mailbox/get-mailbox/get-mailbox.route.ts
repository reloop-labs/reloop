import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { getMailboxController } from "./get-mailbox.controllers";

export const getMailboxRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/:id",
		async ({ params: { id }, organizationId }) => {
			return getMailboxController(id, organizationId);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Mailbox ID" }),
			}),
			response: {
				200: MailModel.mailboxDetailResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Mailboxes"],
				summary: "Get Mailbox",
				description: "Retrieve details of a specific mailbox by ID",
			},
		},
	);
