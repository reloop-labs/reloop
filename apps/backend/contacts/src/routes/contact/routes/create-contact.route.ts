import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { createContactHandler } from "@be/contacts/routes/contact/controllers/create-contact";
import { Elysia } from "elysia";

export const createContactRoute = new Elysia().use(authMiddleware).post(
	"/create",
	async ({ body, activeOrganizationId, userId }) => {
		return await createContactHandler(activeOrganizationId, userId, body);
	},
	{
		auth: true,
		body: ContactModel.createContactBody,
		response: {
			201: ContactModel.contactResponse,
			409: ContactModel.contactAlreadyExists,
			400: ContactModel.invalidEmail,
			403: ContactModel.unauthorized,
		},
		detail: {
			tags: ["Contact"],
			summary: "Create contact",
			description: "Creates a contact",
		},
	},
);
