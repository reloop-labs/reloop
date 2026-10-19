import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { auditLogHook } from "@be/contacts/utils/audit-log";
import { updateContactXCodeSamples } from "@reloop/code-samples/contacts";
import { Elysia, t } from "elysia";
import { updateContactController } from "./update-contact.controllers";

export const updateContactRoute = new Elysia()
	.use(authMiddleware)
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
