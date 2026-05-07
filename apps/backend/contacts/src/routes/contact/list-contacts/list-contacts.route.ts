import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia } from "elysia";
import { listContactsController } from "./list-contacts.controllers";
import { listContactsXCodeSamples } from "./list-contacts.x-codeSamples";

export const listContactsRoute = new Elysia().use(authMiddleware).get(
	"/list",
	async ({ query, activeOrganizationId, logger }) => {
		return await listContactsController({
			organizationId: activeOrganizationId as string,
			query,
			logger,
		});
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
			summary: "List Contacts",
			description:
				"Retrieves a paginated list of contacts with optional filtering and search",
			"x-codeSamples": listContactsXCodeSamples,
		},
	},
);
