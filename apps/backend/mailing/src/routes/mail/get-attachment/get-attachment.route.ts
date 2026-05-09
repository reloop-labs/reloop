import { authMiddleware } from "@reloop/be-mailing/middleware/auth";
import { MailModel } from "@reloop/be-mailing/model/mail.model.js";
import { Elysia, status } from "elysia";
import { getAttachmentController } from "./get-attachment.controllers";

export const getAttachmentRoute = new Elysia().use(authMiddleware).get(
	"/:emailId/attachments/:id",
	async ({ params, activeOrganizationId }) => {
		if (!activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await getAttachmentController({
			organizationId: activeOrganizationId,
			emailId: params.emailId,
			attachmentId: params.id,
		});
	},
	{
		auth: true,
		params: MailModel.getAttachmentParams,
		response: {
			200: MailModel.getAttachmentResponse,
			401: MailModel.unauthorized,
			403: MailModel.forbidden,
			404: MailModel.badRequest,
			500: MailModel.internalServerError,
		},
		detail: {
			tags: ["Mail"],
			summary: "Retrieve Attachment",
			description: "Retrieve a single attachment from a sent email",
		},
	},
);
