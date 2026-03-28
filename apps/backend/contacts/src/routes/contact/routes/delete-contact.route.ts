import { deleteContactSamples } from "@be/contacts/code-samples/contact/delete-contact";
import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { deleteContactHandler } from "@be/contacts/routes/contact/controllers/delete-contact";
import { Elysia, t } from "elysia";

export const deleteContactRoute = new Elysia().use(authMiddleware).delete(
	"/:contact_id",
	async ({ params, activeOrganizationId }) => {
		return await deleteContactHandler(params.contact_id, activeOrganizationId);
	},
	{
		auth: true,
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
			"x-codeSamples": deleteContactSamples,
		},
	},
);
