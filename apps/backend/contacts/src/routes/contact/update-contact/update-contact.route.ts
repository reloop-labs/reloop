import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia, t } from "elysia";
import { updateContactController } from "./update-contact.controllers";
import { updateContactXCodeSamples } from "./update-contact.x-codeSamples";

export const updateContactRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "contact-update" }))
	.patch(
		"/:contact_id",
		async ({
			params,
			body,
			activeOrganizationId,
			path,
			request,
			headers,
		}) => {
			const cookieString = headers["cookie"] || "";
			return await updateContactController({
				contactId: params.contact_id,
				organizationId: activeOrganizationId,
				body,
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
			body: ContactModel.updateContactBody,
			response: {
				200: ContactModel.contactResponse,
				404: ContactModel.contactNotFound,
				400: ContactModel.validationError,
				403: ContactModel.unauthorized,
			},
			detail: {
				tags: ["Contact"],
				summary: "Update Contact",
				description: "Updates an existing contact's information",
				"x-codeSamples": updateContactXCodeSamples,
			},
		},
	);
