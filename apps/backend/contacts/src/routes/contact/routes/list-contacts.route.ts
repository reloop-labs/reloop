import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { listContactsHandler } from "@be/contacts/routes/contact/controllers/list-contacts";
import { Elysia } from "elysia";

export const listContactsRoute = new Elysia().use(authMiddleware).get(
	"/list",
	async ({ query, activeOrganizationId, logger }) => {
		return await listContactsHandler((activeOrganizationId as string), query, logger);
	},
	{
		auth: true,
		query: ContactModel.contactQuery,
		response: {
			200: ContactModel.contactListResponse,
			403: ContactModel.unauthorized,
		},
		detail: {
			tags: ["Contact"],
			summary: "List contacts",
			description:
				"Retrieves a paginated list of contacts with optional filtering and search",
		},
	},
);
