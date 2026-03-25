import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { deleteContactHandler } from "@be/contacts/routes/contact/controllers/delete-contact";
import { Elysia, t } from "elysia";

export const deleteContactRoute = new Elysia().use(authMiddleware).delete(
	"/delete/:id",
	async ({ params, activeOrganizationId }) => {
		return await deleteContactHandler(params.id, activeOrganizationId);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String(),
		}),
		response: {
			200: t.Object({
				message: t.String(),
			}),
			404: ContactModel.contactNotFound,
			403: ContactModel.unauthorized,
		},
		detail: {
			tags: ["Contact"],
			summary: "Delete A Contact",
			description: "Removes a contact from the organization",
		},
	},
);
