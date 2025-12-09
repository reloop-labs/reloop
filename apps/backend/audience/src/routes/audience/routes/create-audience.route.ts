import { authMiddleware } from "@be/audience/middleware/auth";
import { ContactModel } from "@be/audience/model/contact.model";
import { createContactHandler } from "@be/audience/routes/audience/controllers/create-audience";
import { Elysia } from "elysia";

export const createContactRoute = new Elysia().use(authMiddleware).post(
	"/add",
	async ({ body, user }) => {
		const { activeOrganizationId } = user;
		return await createContactHandler(activeOrganizationId, body);
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
			summary: "Create a new contact",
			description: "Adds a new contact to the organization",
		},
	},
);
