import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { getMessageController } from "./get-message.controllers";

export const getMessageRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/:id",
		async ({ params: { id }, organizationId }) => {
			return getMessageController(id, organizationId);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Message ID" }),
			}),
			response: {
				200: MailModel.messageItem,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "Get Message",
				description: "Retrieve details of a single email message by ID",
			},
		},
	);
