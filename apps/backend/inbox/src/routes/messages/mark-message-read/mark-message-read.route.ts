import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { markMessageReadController } from "./mark-message-read.controllers";

export const markMessageReadRoute = new Elysia().use(authMiddleware).patch(
	"/:id/read",
	async ({ params: { id }, body, organizationId }) => {
		return markMessageReadController(id, organizationId, body.isRead);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Message ID" }),
		}),
		body: t.Object({
			isRead: t.Boolean({ description: "Whether to mark the message as read" }),
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
			tags: ["Messages"],
			summary: "Mark Message Read",
			description: "Direct endpoint to update read/unread status of a message",
		},
	},
);
