import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { getMessageAttachmentXCodeSamples } from "@reloop/code-samples/inbox";
import { Elysia, t } from "elysia";
import { getMessageAttachmentController } from "./get-message-attachment.controllers";

export const getMessageAttachmentRoute = new Elysia().use(authMiddleware).get(
	"/:id/attachments/:attachmentId",
	async ({ params: { id, attachmentId }, organizationId }) => {
		return getMessageAttachmentController(id, attachmentId, organizationId);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String({ description: "Message ID" }),
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
			tags: ["Messages"],
			summary: "Get Message Attachment",
			description: "Retrieve attachment details of a message",
			"x-codeSamples": getMessageAttachmentXCodeSamples,
		},
	},
);
