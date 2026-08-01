import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { getThreadAttachmentXCodeSamples } from "@reloop/code-samples/inbox";
import { Elysia, t } from "elysia";
import { getThreadAttachmentController } from "./get-thread-attachment.controllers";

export const getThreadAttachmentRoute = new Elysia().use(authMiddleware).get(
	"/:id/attachments/:attachmentId",
	async ({ params: { id, attachmentId }, organizationId }) => {
		return getThreadAttachmentController(id, attachmentId, organizationId);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Thread ID" }),
			attachmentId: t.String({ description: "Attachment ID" }),
		}),
		response: {
			200: MailModel.messageAttachmentResponse,
			401: MailModel.ErrorResponseSchema,
			403: MailModel.ErrorResponseSchema,
			404: MailModel.ErrorResponseSchema,
			500: MailModel.ErrorResponseSchema,
		},
		detail: {
			tags: ["Threads"],
			summary: "Get Thread Attachment",
			description:
				"Retrieve an attachment within a specific thread conversation",
			"x-codeSamples": getThreadAttachmentXCodeSamples,
		},
	},
);
