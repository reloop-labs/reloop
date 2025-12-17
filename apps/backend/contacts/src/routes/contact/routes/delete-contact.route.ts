import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { deleteContactHandler } from "@be/contacts/routes/contact/controllers/delete-contact";
import type { User } from "@reloop/auth/server";
import { Elysia, t } from "elysia";

export const deleteContactRoute = new Elysia().use(authMiddleware).delete(
	"/delete/:id",
	async ({ params, user }: { params: { id: string }; user: User }) => {
		const { activeOrganizationId } = user;
		return await deleteContactHandler(
			params.id,
			activeOrganizationId as string,
		);
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
			summary: "Delete a contact",
			description: "Removes a contact from the organization",
		},
	},
);
