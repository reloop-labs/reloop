import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { getContactHandler } from "@be/contacts/routes/contact/controllers/get-contact";
import { Elysia, t } from "elysia";

export const getContactRoute = new Elysia().use(authMiddleware).get(
	"/get/:id",
	async ({ params, activeOrganizationId }) => {
		return await getContactHandler(params.id, activeOrganizationId);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String(),
		}),
		response: {
			200: ContactModel.contactResponse,
			404: ContactModel.contactNotFound,
			403: ContactModel.unauthorized,
		},
		detail: {
			tags: ["Contact"],
			summary: "Get a contact",
			description: "Retrieves a specific contact by ID",
		},
	},
);
