import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia } from "elysia";
import { requestExportEmailController } from "./export-email.controllers";

export const exportEmailRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 3,
			windowSeconds: 3600,
			namespace: "export-contacts-email",
		}),
	)
	.post(
		"/export/email",
		async ({ body, organizationId, userId, status }) => {
			const result = await requestExportEmailController({
				organizationId: organizationId as string,
				userId: userId as string,
				query: body,
			});
			return status(202, result);
		},
		{
			auth: true,
			rateLimit: true,
			body: ContactModel.contactExportEmailBody,
			response: {
				202: ContactModel.contactExportEmailResponse,
			},
			detail: {
				tags: ["Contact"],
				summary: "Email Contacts Export",
				description:
					"Queues a CSV export of the filtered contacts and emails a 7-day signed download link to the requesting user's account email. Returns 202 immediately; generation, S3 upload, and delivery happen in the background. Rate-limited to 3 per hour per organization.",
			},
		},
	);
