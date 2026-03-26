import { createContactSamples } from "@be/contacts/code-samples/contact/create-contact";
import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { createContact } from "@be/contacts/routes/contact/controllers/create-contact";
import { Elysia } from "elysia";

export const createContactRoute = new Elysia().use(authMiddleware).post(
	"/create",
	async ({ body, activeOrganizationId, userId, logger }) => {
		return await createContact(
			activeOrganizationId,
			userId,
			{ ...body, object: "contact" },
			logger,
		);
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
			summary: "Create Contact",
			description: "Creates contact",
		},
	},
);
