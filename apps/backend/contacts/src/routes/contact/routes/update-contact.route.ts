import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { updateContactHandler } from "@be/contacts/routes/contact/controllers/update-contact";
import type { User } from "@reloop/auth/server";
import { Elysia, t } from "elysia";

export const updateContactRoute = new Elysia().use(authMiddleware).put(
	"/update/:id",
	async ({
		params,
		body,
		user,
	}: {
		params: { id: string };
		body: ContactModel.UpdateContactBody;
		user: User;
	}) => {
		const { activeOrganizationId } = user;
		return await updateContactHandler(
			params.id,
			activeOrganizationId as string,
			body,
		);
	},
	{
		auth: true,
		params: t.Object({
			id: t.String(),
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
			summary: "Update a contact",
			description: "Updates an existing contact's information",
		},
	},
);
