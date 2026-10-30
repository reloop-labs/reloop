import {
	assertMessageAllowed,
	resolveMailboxScope,
} from "@reloop/be-inbox/lib/api-key-mailbox-scope";
import { authMiddleware } from "@reloop/be-inbox/middleware/auth";
import { MailModel } from "@reloop/be-inbox/model/mail.model";
import { Elysia, t } from "elysia";
import { getMessageAttachmentContentController } from "../get-message-attachment/get-message-attachment.controllers";

export const getMessageAttachmentContentRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/:id/attachments/:attachmentId/content",
		async ({
			params: { id, attachmentId },
			query,
			organizationId,
			apiKeyId,
		}) => {
			const scope = await resolveMailboxScope(organizationId, apiKeyId);
			await assertMessageAllowed(scope, organizationId, id);
			return getMessageAttachmentContentController(
				id,
				attachmentId,
				organizationId,
				query.inline === "true",
			);
		},
		{
			auth: true,
			params: t.Object({
				id: t.String({ description: "Message ID" }),
				attachmentId: t.String({ description: "Attachment ID" }),
			}),
			query: t.Object({
				inline: t.Optional(
					t.String({
						description:
							"Set to `true` to render images inline instead of downloading. Non-image files always download.",
					}),
				),
			}),
			response: {
				401: MailModel.ErrorResponseSchema,
				403: MailModel.ErrorResponseSchema,
				404: MailModel.ErrorResponseSchema,
				500: MailModel.ErrorResponseSchema,
			},
			detail: {
				tags: ["Messages"],
				summary: "Download Message Attachment",
				description:
					"Download the raw bytes of a message attachment. Received attachments are returned directly; attachments on sent messages redirect to the stored file.",
				responses: {
					200: {
						description: "The attachment file",
						content: {
							"application/octet-stream": {
								schema: { type: "string", format: "binary" },
							},
						},
					},
				},
			},
		},
	);
