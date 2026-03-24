import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { searchContactsHandler } from "@be/contacts/routes/contact/controllers/search-contacts";
import { Elysia } from "elysia";

export const searchContactsRoute = new Elysia().use(authMiddleware).get(
	"/search",
	async ({ query, activeOrganizationId, logger }) => {
		return await searchContactsHandler((activeOrganizationId as string), query, logger);
	},
	{
		auth: true,
		query: ContactModel.searchContactsQuery,
		response: {
			200: ContactModel.contactListResponse,
			403: ContactModel.unauthorized,
		},
		detail: {
			tags: ["Contact"],
			summary: "Search contacts",
			description: "Performs advanced search across contact fields",
		},
	},
);
