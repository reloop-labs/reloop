import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ContactModel } from "@be/contacts/model/contact.model";
import { GroupModel } from "@be/contacts/model/group.model";
import { listGroupContactsController } from "@be/contacts/routes/group/list-group-contacts/list-group-contacts.controllers";
import { Elysia, t } from "elysia";
import { listGroupContactsXCodeSamples } from "./list-group-contacts.x-codeSamples";

export const listGroupContactsRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 60,
			windowSeconds: 60,
			namespace: "list-group-contacts",
		}),
	)
	.get(
		"/:group_id/contacts",
		async ({ params, query, organizationId, logger }) => {
			return await listGroupContactsController({
				organizationId,
				group_id: params.group_id,
				query,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({
				group_id: t.String({ description: "ID of the group" }),
			}),
			query: ContactModel.contactQuery,
			response: {
				200: ContactModel.groupContactListResponse,
				403: ContactModel.unauthorized,
				404: GroupModel.groupNotFound,
			},
			detail: {
				tags: ["Groups"],
				summary: "List Contacts in Group",
				description: "List all contacts belonging to a specific group",
				"x-codeSamples": listGroupContactsXCodeSamples,
			},
		},
	);
