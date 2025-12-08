import { authMiddleware } from "@be/audience/middleware/auth";
import { ContactModel } from "@be/audience/model/contact.model";
import { searchContactsHandler } from "@be/audience/routes/audience/controllers/search-audiences";
import { Elysia } from "elysia";

export const searchContactsRoute = new Elysia().use(authMiddleware).get(
	"/search",
	async ({ query, user }) => {
		const { activeOrganizationId } = user;
		return await searchContactsHandler(activeOrganizationId as string, query);
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
