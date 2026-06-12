import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ContactModel } from "@be/contacts/model/contact.model";
import { auditLogHook } from "@be/contacts/utils/audit-log";
import { Elysia, t } from "elysia";
import { updateContactController } from "./update-contact.controllers";
import { updateContactXCodeSamples } from "./update-contact.x-codeSamples";

export const updateContactRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 30,
			windowSeconds: 60,
			namespace: "contact-update",
		}),
	)
	.patch(
		"/:contact_id",
		async ({ params, body, organizationId }) => {
			return await updateContactController({
				contactId: params.contact_id,
				organizationId,
				email: body.email,
				firstName: body.firstName,
				lastName: body.lastName,
				status: body.status,
				properties: body.properties,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({
				contact_id: t.String({
					description: "Unique contact identifier",
					examples: ["cont_123456789"],
				}),
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
			afterResponse: auditLogHook({
				resourceType: "contact",
				action: "updated",
				successStatus: 200,
			}),
		},
	);
