import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia, t } from "elysia";
import { deleteContactController } from "./delete-contact.controllers";
import { deleteContactXCodeSamples } from "./delete-contact.x-codeSamples";

import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";

export const deleteContactRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "delete-contact" }))
	.delete(
	"/:contact_id",
	async ({ params, activeOrganizationId, logger, path, request, headers }) => {
		const cookieString = headers["cookie"] || "";
		return await deleteContactController({
			contactId: params.contact_id,
			organizationId: activeOrganizationId,
			logger,
			cookie: cookieString,
			requestDetails: {
				endpoint: path,
				method: request.method,
				userAgent: headers["user-agent"],
				ipAddress:
					(headers["x-forwarded-for"] as string) ||
					(headers["x-real-ip"] as string),
			},
		});
	},
	{
		auth: true,
		rateLimit: true,
		params: t.Object({
			contact_id: t.String(),
		}),
		response: {
			200: ContactModel.deleteResponse,
			404: ContactModel.contactNotFound,
			403: ContactModel.unauthorized,
		},
		detail: {
			tags: ["Contact"],
			summary: "Delete Contact",
			description: "Removes a contact from the organization",
			"x-codeSamples": deleteContactXCodeSamples,
		},
	},
);
