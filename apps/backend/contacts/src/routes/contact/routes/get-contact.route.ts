import { getContactSamples } from "@be/contacts/code-samples/contact/get-contact";
import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { getContactHandler } from "@be/contacts/routes/contact/controllers/get-contact";
import { Elysia, t } from "elysia";

export const getContactRoute = new Elysia().use(authMiddleware).get(
	"/retrieve/:contact_id",
	async ({ params, activeOrganizationId }) => {
		return await getContactHandler(params.contact_id, activeOrganizationId);
	},
	{
		auth: true,
		params: t.Object({ contact_id: t.String() }),
		response: {
			200: ContactModel.contactResponse,
			404: ContactModel.contactNotFound,
			403: ContactModel.unauthorized,
		},
		detail: {
			tags: ["Contact"],
			summary: "Retrieve Contact",
			description: "Retrieves a contact by ID",
			"x-codeSamples": getContactSamples,
		},
	},
);
