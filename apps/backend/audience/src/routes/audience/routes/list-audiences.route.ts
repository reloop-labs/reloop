import { authMiddleware } from "@be/audience/middleware/auth";
import { ContactModel } from "@be/audience/model/contact.model";
import { listContactsHandler } from "@be/audience/routes/audience/controllers/list-audiences";
import { Elysia } from "elysia";

export const listContactsRoute = new Elysia().use(authMiddleware).get(
	"/list",
	async ({ query, user }) => {
		const { activeOrganizationId } = user;
		return await listContactsHandler(activeOrganizationId, query);
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
