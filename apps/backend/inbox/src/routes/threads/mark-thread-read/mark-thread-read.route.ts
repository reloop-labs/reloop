import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { markThreadReadController } from "./mark-thread-read.controllers";
import { markThreadReadXCodeSamples } from "./mark-thread-read.x-codeSamples";

export const markThreadReadRoute = new Elysia().use(authMiddleware).patch(
	"/:id/read",
	async ({ params: { id }, body, organizationId }) => {
		return markThreadReadController(id, organizationId, body.isRead);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Thread ID" }),
		}),
		body: t.Object({
			isRead: t.Boolean({ description: "Whether to mark the thread as read" }),
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
			tags: ["Threads"],
			summary: "Mark Thread Read",
			description: "Direct endpoint to update read/unread status of a thread",
			"x-codeSamples": markThreadReadXCodeSamples,
		},
	},
);
