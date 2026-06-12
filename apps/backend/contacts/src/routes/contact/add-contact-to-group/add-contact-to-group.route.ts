import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ContactModel } from "@be/contacts/model/contact.model";
import { auditLogHook } from "@be/contacts/utils/audit-log";
import { Elysia, t } from "elysia";
import { addContactToGroupController } from "./add-contact-to-group.controllers";
import { addContactToGroupXCodeSamples } from "./add-contact-to-group.x-codeSamples";

export const addContactToGroupRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "add-group" }))
	.post(
		"/group/:group_id",
		async ({ body, params, organizationId }) => {
			return await addContactToGroupController({
				organizationId,
				groupId: params.group_id,
				contact_id: body.contact_id,
				email: body.email,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({
				group_id: t.String({
					description: "Group ID",
					examples: ["grp_123456789"],
				}),
			}),
			body: ContactModel.addContactToGroupBody,
			response: {
				200: ContactModel.addContactToGroupResponse,
				400: t.Object({ message: t.String() }),
				404: t.Object({ message: t.String() }),
			},
			detail: {
				tags: ["Contact"],
				summary: "Add Contact Group",
				description: "Adds a contact to a group by ID or email",
				"x-codeSamples": addContactToGroupXCodeSamples,
			},
			afterResponse: auditLogHook({
				resourceType: "contact",
				action: "added_to_group",
				successStatus: 200,
			}),
		},
	);
