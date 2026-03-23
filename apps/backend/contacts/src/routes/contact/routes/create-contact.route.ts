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
			summary: "Create Contact",
			description: "Creates contact",
			responses: {
				201: {
					description: "Contact created successfully",
					content: {
						"application/json": {
							example: {
								id: "con_123456789",
								email: "john.doe@example.com",
								firstName: "John",
								lastName: "Doe",
								status: "subscribed",
								properties: {
									company: "Reloop",
									role: "Developer",
								},
								createdAt: "2026-03-23T10:00:00Z",
								updatedAt: "2026-03-23T10:00:00Z",
							},
						},
					},
				},
			},
		},
	},
);
