import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { deleteMessageController } from "./delete-message.controllers";

export const deleteMessageRoute = new Elysia()
	.use(authMiddleware)
	.delete(
		"/:id",
		async ({ params: { id }, organizationId }) => {
			return deleteMessageController(id, organizationId);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Message ID" }),
			}),
			response: {
				200: MailModel.successResponse,
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "Delete Message",
				description: "Permanently delete an email message",
			},
		},
	);
