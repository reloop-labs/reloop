import { authMiddleware } from "@reloop/be-mailing/middleware/auth";
import { MailModel } from "@reloop/be-mailing/model/mail.model.js";
import { Elysia } from "elysia";
import { sendEmailController } from "./send-email.controllers";

export const sendEmailRoute = new Elysia().use(authMiddleware).post(
	"/send",
	async ({ body, activeOrganizationId, logger }) => {
		return await sendEmailController({
			organizationId: activeOrganizationId,
			body,
			logger,
		});
	},
	{
		auth: true,
		body: MailModel.sendEmailBody,
		response: {
			200: MailModel.sendEmailResponse,
			401: MailModel.unauthorized,
			403: MailModel.forbidden,
			400: MailModel.badRequest,
			500: MailModel.internalServerError,
		},
		detail: {
			tags: ["Mail"],
			summary: "Send email",
			description: "Send an email through the KumoMTA mail server",
		},
	},
);
