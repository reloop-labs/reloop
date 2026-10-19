import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { listContactsXCodeSamples } from "@reloop/code-samples/contacts";
import { Elysia } from "elysia";
import { listContactsController } from "./list-contacts.controllers";

export const listContactsRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/list",
		async ({ query, organizationId }) => {
			return await listContactsController({
				organizationId: organizationId as string,
				query,
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
					"Retrieves a paginated list of contacts with optional filtering and search. Pass channelId to return only contacts enrolled in that channel.",
				"x-codeSamples": listContactsXCodeSamples,
			},
		},
	);
