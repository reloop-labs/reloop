import { listGroupContactsSamples } from "@be/contacts/code-samples/group/list-group-contacts";
import { authMiddleware } from "@be/contacts/middleware/auth";
import { ContactModel } from "@be/contacts/model/contact.model";
import { listGroupContactsHandler } from "@be/contacts/routes/group/controllers/list-group-contacts";
import { Elysia, t } from "elysia";

export const listGroupContactsRoute = new Elysia().use(authMiddleware).get(
	"/:group_id/contacts",
	async ({ params, query, activeOrganizationId, logger }) => {
		return await listGroupContactsHandler(
			activeOrganizationId as string,
			params.group_id,
			query,
			logger,
		);
	},
	{
		auth: true,
		params: t.Object({
			group_id: t.String({ description: "ID of the contact group" }),
		}),
		query: ContactModel.contactQuery,
		response: {
			200: ContactModel.groupContactListResponse,
			403: ContactModel.unauthorized,
		},
		detail: {
			tags: ["Groups"],
			summary: "List Contacts Group",
			description: "List all contacts belonging to a specific group",
			"x-codeSamples": listGroupContactsSamples,
		},
	},
);
